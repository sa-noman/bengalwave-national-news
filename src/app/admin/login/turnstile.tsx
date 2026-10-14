'use client';
import Script from 'next/script';
import {useCallback, useEffect, useRef} from 'react';

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

/** Invisible, just-in-time verification keeps the existing form appearance. */
export function LoginTurnstile({siteKey, nonce}: {siteKey: string; nonce: string}) {
  const container = useRef<HTMLDivElement>(null);
  const token = useRef<HTMLInputElement>(null);
  const widget = useRef<string | null>(null);
  const pending = useRef<{submitter: HTMLElement | null} | null>(null);
  const verified = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const api = useCallback(() => (window as Window & {turnstile?: Turnstile}).turnstile, []);
  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const fail = useCallback(() => {
    clearTimer();
    if (token.current) token.current.value = '';
    verified.current = false;
    if (pending.current) {
      pending.current = null;
      window.location.assign('/admin/login?error=captcha');
    }
  }, [clearTimer]);
  const render = useCallback(() => {
    const turnstile = api();
    if (!turnstile || !container.current || widget.current !== null) return;
    widget.current = turnstile.render(container.current, {
      sitekey: siteKey, action: 'admin_login', execution: 'execute', 'response-field': false,
      callback: (value: string) => {
        if (!value || !pending.current) return;
        clearTimer();
        if (token.current) token.current.value = value;
        const request = pending.current;
        pending.current = null;
        verified.current = true;
        container.current?.closest('form')?.requestSubmit(request.submitter || undefined);
      },
      'expired-callback': fail,
      'timeout-callback': fail,
      'error-callback': fail,
    });
    if (pending.current) turnstile.execute(widget.current);
  }, [api, clearTimer, fail, siteKey]);
  useEffect(() => {
    const form = container.current?.closest('form');
    if (!form) return;
    const submit = (event: SubmitEvent) => {
      if (verified.current) {verified.current = false; return;}
      event.preventDefault();
      event.stopImmediatePropagation();
      if (pending.current) return;
      if (token.current) token.current.value = '';
      pending.current = {submitter: event.submitter};
      timer.current = setTimeout(fail, 20000);
      if (widget.current !== null) {
        api()?.reset(widget.current);
        api()?.execute(widget.current);
      } else render();
    };
    form.addEventListener('submit', submit);
    render();
    return () => {
      form.removeEventListener('submit', submit);
      clearTimer();
      pending.current = null;
      verified.current = false;
      if (widget.current !== null) api()?.remove(widget.current);
      widget.current = null;
    };
  }, [api, clearTimer, fail, render]);
  return <>
    <input ref={token} type="hidden" name="cf-turnstile-response" defaultValue=""/>
    <div ref={container} style={{position:'absolute',width:0,height:0,overflow:'hidden'}}/>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" nonce={nonce} onReady={render} onError={fail}/>
  </>;
}
