import { toPng } from "html-to-image";

export async function shareOrDownloadImage(element: HTMLElement, filename: string) {
    const dataUrl = await toPng(element, { pixelRatio: 3, cacheBust: true });

    const blob = await fetch(dataUrl).then((r) => r.blob());
    const file = new File([blob], `${filename}.png`, { type: "image/png" });

    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
    } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${filename}.png`;
        a.click();
    }
}

export async function fetchFlagDataUrl(iso2: string): Promise<string> {
    try {
        const url = `https://flagcdn.com/w80/${iso2.toLowerCase()}.png`;
        const response = await fetch(url);
        const blob = await response.blob();
        return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    } catch {
        return "";
    }
}
