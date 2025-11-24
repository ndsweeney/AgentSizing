import mermaid from 'mermaid';

// Initialize mermaid (ensure it's initialized only once or safely)
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Helvetica', // Match PDF font
});

export async function renderMermaidToPng(code: string): Promise<{ imageUrl: string; width: number; height: number }> {
  try {
    const id = `mermaid-pdf-${Math.random().toString(36).substring(2, 9)}`;
    
    // Render SVG
    const { svg } = await mermaid.render(id, code);
    
    // Extract dimensions from SVG string if possible
    const widthMatch = svg.match(/width="([\d.]+)px"/);
    const heightMatch = svg.match(/height="([\d.]+)px"/);
    const viewBoxMatch = svg.match(/viewBox="([\d\s.-]+)"/);
    
    let naturalWidth = 0;
    let naturalHeight = 0;

    if (widthMatch && heightMatch) {
      naturalWidth = parseFloat(widthMatch[1]);
      naturalHeight = parseFloat(heightMatch[1]);
    } else if (viewBoxMatch) {
      const [, , w, h] = viewBoxMatch[1].split(/\s+/).map(parseFloat);
      naturalWidth = w;
      naturalHeight = h;
    }

    // Convert SVG to PNG
    const result = await svgToPng(svg);
    
    // Use parsed dimensions if available, otherwise fallback to image dimensions
    return {
      imageUrl: result.imageUrl,
      width: naturalWidth || result.width,
      height: naturalHeight || result.height
    };
  } catch (error) {
    console.error('Failed to render mermaid diagram:', error);
    throw error;
  }
}

function svgToPng(svgString: string): Promise<{ imageUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Encode SVG string to base64 to avoid parsing issues
    const svg64 = btoa(unescape(encodeURIComponent(svgString)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Scale up for better quality in PDF
      const scale = 2; 
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // White background (PDFs don't like transparency sometimes)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      
      resolve({
        imageUrl: canvas.toDataURL('image/png'),
        width: img.width,
        height: img.height
      });
    };
    
    img.onerror = (e) => {
      reject(new Error(`Failed to load SVG image: ${e}`));
    };
    
    img.src = image64;
  });
}
