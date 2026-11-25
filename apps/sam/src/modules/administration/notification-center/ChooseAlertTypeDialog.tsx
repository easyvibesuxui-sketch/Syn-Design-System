import { Dialog } from '@syn/design-system';
import { alertTypeOrder, alertTypes, type AlertType } from './data';

/** Figma "choose" (14085:94424): pick the kind of alert before the create drawer opens. */
export function ChooseAlertTypeDialog({ open, onClose, onChoose }: {
  open: boolean;
  onClose: () => void;
  onChoose: (type: AlertType) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Choose alert type" icon={null} className="sam-nc-choose">
      <ul className="sam-nc-choose__list">
        {alertTypeOrder.map((t) => (
          <li key={t}>
            <button type="button" className="sam-nc-choose__card" onClick={() => onChoose(t)}>
              <img src={alertTypes[t].icon} alt="" width={56} height={56} />
              <span className="sam-nc-choose__title">{alertTypes[t].label}</span>
              <span className="sam-nc-choose__text">{alertTypes[t].description}</span>
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
