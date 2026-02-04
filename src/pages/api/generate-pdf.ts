import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { html, css } = await request.json();

        if (!html) {
            return new Response('Missing HTML content', { status: 400 });
        }

        console.log('Launching browser...');
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();

        console.log(`Setting content... HTML length: ${html?.length || 0}, CSS length: ${css?.length || 0}`);
        const fullContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <!-- Using system fonts to reduce PDF size -->
                <style>
                    body { font-family: sans-serif; }
                    @page { margin: 0; size: A4; }
                    body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    * { box-sizing: border-box; }
                    ${css || ''}
                </style>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;

        await page.setContent(fullContent, {
            waitUntil: 'networkidle0'
        });

        await page.evaluateHandle('document.fonts.ready');
        // Small delay to ensure rendering settles
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Generating PDF...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            preferCSSPageSize: false,
            tagged: false,
            outline: false,
            displayHeaderFooter: false,
            omitBackground: false
        });

        await browser.close();
        console.log('PDF generated, now compressing...');

        // Aggressive compression with pdf-lib
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        // Remove metadata to save space
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setCreator('');
        pdfDoc.setProducer('');

        const compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true, // Changed to true for better compression
            addDefaultPage: false,
            objectsPerTick: 100 // Increased for better compression
        });

        const originalKB = Math.round(pdfBuffer.length / 1024);
        const compressedKB = Math.round(compressedPdfBytes.length / 1024);
        console.log(`PDF: ${originalKB}KB -> ${compressedKB}KB (${Math.round((1 - compressedKB / originalKB) * 100)}% reduction)`);

        return new Response(Buffer.from(compressedPdfBytes), {
            headers: {
                'Content-Type': 'application/pdf'
            }
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return new Response('Error generating PDF', { status: 500 });
    }
};
