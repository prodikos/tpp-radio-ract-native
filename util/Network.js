/**
 * URL-Encode the given parameters
 */
export function urlEncode(params) {
  return Object.keys(params)
    .map(key => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    })
    .join("&");
}
