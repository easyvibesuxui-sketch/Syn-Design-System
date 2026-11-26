import { useState } from 'react';
import { Button, Drawer, Icon } from '@syn/design-system';
import { EquipmentSelectTable, sampleBranchTree, sampleCategoryTree, sampleTrackers } from '@syn/shared-equipment';
import { equipment, sampleNow } from './data';

/**
 * Add Equipment (IoT Alerts Manager): the SHARED equipment selection table, the same one RAM uses
 * (V15 › Target Design › Add Equipment). Discard leaves the alert's equipment as it was; Submit takes the selection.
 */
export function EquipmentPicker({ open, selected, onClose, onSubmit }: {
  open: boolean;
  selected: string[];
  onClose: () => void;
  onSubmit: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(selected);
  return (
    <Drawer
      open={open} onClose={onClose} label="Add equipment" className="sam-picker"
      headerStart={(
        <button type="button" className="sam-picker__back" onClick={onClose}>
          <Icon name="back" size={20} />
          Add Equipment
        </button>
      )}
      footer={(
        <>
          <Button variant="text" onClick={onClose}>Discard</Button>
          <p className="sam-picker__count" aria-live="polite">{picked.length} selected</p>
          <Button disabled={!picked.length} onClick={() => onSubmit(picked)}>Submit selected equipment</Button>
        </>
      )}
    >
      <EquipmentSelectTable
        records={equipment} categoryTree={sampleCategoryTree} branchTree={sampleBranchTree} trackers={sampleTrackers}
        selected={picked} onSelectedChange={setPicked} now={sampleNow}
      />
    </Drawer>
  );
}
