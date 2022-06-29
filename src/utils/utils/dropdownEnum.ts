import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

export type DropdownProps = {
  dropdownLabel: string;
};

abstract class DropdownEnum<T> extends ObjectEnum<T> {
  protected readonly dropdownLabel: string;

  protected constructor(value: T, { dropdownLabel }) {
    super(value);
    this.dropdownLabel = dropdownLabel;
  }

  getDropdownLabel = (): string => this.dropdownLabel;
}

export default DropdownEnum;
