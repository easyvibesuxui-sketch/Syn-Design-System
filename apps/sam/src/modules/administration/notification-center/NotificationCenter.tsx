import { useState } from 'react';
import { LineTabs } from '../../../shared/LineTabs';
import { AlertsTab } from './AlertsTab';
import { AlertHistoryTab } from './AlertHistoryTab';
import { useAlerts } from './useAlerts';
import './NotificationCenter.css';

const tabs = [
  { id: 'alerts', label: 'Alerts' },
  { id: 'history', label: 'Alert History' },
];

/** Settings › Notification Center: the alert rules and the log of alerts that fired. */
export function NotificationCenter() {
  const [tab, setTab] = useState('alerts');
  const store = useAlerts();
  return (
    <div className="sam-nc">
      <div className="sam-nc__tabs">
        <LineTabs items={tabs} value={tab} onChange={setTab} label="Notification Center" idPrefix="sam-nc" />
      </div>
      <div className="sam-nc__frame" role="tabpanel" id="sam-nc-panel" aria-labelledby={`sam-nc-tab-${tab}`}>
        {tab === 'alerts' ? <AlertsTab store={store} /> : <AlertHistoryTab events={store.history} />}
      </div>
    </div>
  );
}
