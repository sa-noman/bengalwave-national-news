'use client';
import Script from 'next/script';
import {useCallback, useEffect, useRef} from 'react';

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

/** Use an Invisible widget configured in Cloudflare; it has no layout footprint. */
export function LoginTurnstile({siteKey, nonce}: {siteKey: string; nonce: string}) {
  const container = useRef<HTMLDivElement>(null);
  const token = useRef<HTMLInputElement>(null);
  const widget = useRef<string | null>(null);
  const api = useCallback(() => (window as Window & {turnstile?: Turnstile}).turnstile, []);
  const render = useCallback(() => {
    const turnstile = api();
    if (!turnstile || !container.current || widget.current !== null) return;
    widget.current = turnstile.render(container.current, {
      sitekey: siteKey, action: 'admin_login', 'response-field': false,
      callback: (value: string) => {if (token.current) token.current.value = value;},
      'expired-callback': () => {
        if (token.current) token.current.value = '';
        if (widget.current !== null) api()?.reset(widget.current);
      },
      'error-callback': () => {if (token.current) token.current.value = '';},
    });
  }, [api, siteKey]);
  useEffect(() => {
    render();
    return () => {if (widget.current !== null) api()?.remove(widget.current); widget.current = null;};
  }, [api, render]);
  return <>
    <input ref={token} type="hidden" name="cf-turnstile-response" defaultValue=""/>
    <div ref={container} style={{position:'absolute',width:0,height:0,overflow:'hidden'}}/>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" nonce={nonce} onReady={render}/>
  </>;
}
