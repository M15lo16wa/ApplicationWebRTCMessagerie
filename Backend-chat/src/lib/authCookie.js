const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function setRefreshCookie(req, res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.secure,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME);
}

export function readRefreshCookie(req) {
  return req.cookies?.[REFRESH_COOKIE_NAME];
}
