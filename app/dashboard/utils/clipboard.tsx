import { toastify } from "@/app/lib/toastify/toastify-helper";

const handleCopy = async (value: string) => {
    try {
        await navigator.clipboard.writeText(value);
        // Optionally, add feedback for a successful copy
        toastify("info", <p>Copied <strong>{value}</strong> to clipboard</p>);
    } catch (error) {
        // Optionally, add feedback for a failed copy
        toastify("error", <p>Failed to copy <strong>{value}</strong> to clipboard</p>);
    }
};


export { handleCopy };