import { useEffect, useState } from 'react';
import { AppShell } from './layout/AppShell';
import { AdministrationModule, adminSections, type AdminSection } from './modules/administration/AdministrationModule';

/**
 * SAM's modules, routed by the URL hash (#/settings/notification-center). Each module lives in
 * src/modules/<module>; only Administration is built in this app so far.
 */
function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onHash = () => setRoute(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export function App() {
  const [module = 'settings', section] = useRoute();
  if (module === 'settings') {
    const current = adminSections.includes(section as AdminSection) ? (section as AdminSection) : 'notification-center';
    return (
      <AppShell module="Settings" current="settings">
        <AdministrationModule section={current} />
      </AppShell>
    );
  }
  return (
    <AppShell module={module.charAt(0).toUpperCase() + module.slice(1)} current={module}>
      <p className="sam-placeholder">This module is not in the SAM app yet. <a href="#/settings/notification-center">Open Settings</a></p>
    </AppShell>
  );
}
