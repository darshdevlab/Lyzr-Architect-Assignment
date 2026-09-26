import { useEffect, useState } from 'react';
import { EDITION } from '../lib/edition';
export function Brand({ version = true }: { version?: boolean }) {
  return (
    <span className="architect-brand">
      <img src="/favicon.svg" width="32" height="32" alt="" />
      <strong>architect</strong>
      {version && <small>{EDITION}.0</small>}
    </span>
  );
}
export function GoogleMark() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.2H24v8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.7c3.9-3.6 6-8.8 6-15z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5c-1.9 1.2-4.3 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20.4 20.4 0 0 0 24 44z"
      />
      <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8z" />
      <path
        fill="#EA4335"
        d="M24 11.9c3 0 5.6 1 7.7 3l5.8-5.8A19.5 19.5 0 0 0 24 4a20.4 20.4 0 0 0-18.2 11.1l6.8 5.2C14.2 15.5 18.7 11.9 24 11.9z"
      />
    </svg>
  );
}
export function Avatar({ url, name }: { url?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  return !failed && url && /^https:\/\//.test(url) ? (
    <img
      className="profile-photo"
      src={url}
      alt="Your profile"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  ) : (
    <span aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>
  );
}
