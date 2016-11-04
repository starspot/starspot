export default function getLastSegmentFromUrl(url: string): string {
  let pathSeparatorIndex = url.lastIndexOf("/");
  if (pathSeparatorIndex === url.length) { return; }

  return url.substring(pathSeparatorIndex + 1, url.length);
}
