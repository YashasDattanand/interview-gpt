import pdf from "pdf-parse";

export async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    const data = await pdf(file.buffer);
    return data.text;
  }
  return file.buffer.toString("utf-8");
}
