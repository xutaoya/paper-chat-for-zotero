export const MINERU_TOKEN_APPLY_URL = "https://mineru.net/apiManage/token";
export const EXA_API_KEY_APPLY_URL = "https://dashboard.exa.ai/api-keys";

export function bindExternalPrefLink(
  doc: Document,
  elementId: string,
  url: string,
): void {
  const button = doc.getElementById(elementId);
  if (!button) {
    return;
  }

  const open = (event: Event) => {
    event.preventDefault();
    Zotero.launchURL(url);
  };

  button.addEventListener("click", open);
  button.addEventListener("command", open);
}
