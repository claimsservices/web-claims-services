
export function navigateTo(url) {
  window.location.href = url;
}

export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
