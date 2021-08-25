import Money from 'bigint-money';
import Modifier from 'ember-modifier';
import IMask from 'imask';

import type { MaskedPattern } from 'imask';

interface ImaskCurrencyArgs {
  positional: [number | Money | string | undefined, string | undefined];
  named: {
    fractionDigits?: number;
    max?: number;
    min?: number;
    onChange?: (number: number) => void;
  };
}

export default class ImaskCurrency extends Modifier<ImaskCurrencyArgs> {
  mask?: IMask.InputMask<MaskedPattern>;

  constructor(owner: unknown, args: ImaskCurrencyArgs) {
    super(owner, args);

    if (this.args.named.onChange && typeof this.args.named.onChange !== 'function') {
      throw new Error('onChange must be a function');
    }
  }

  get fractionDigits(): number {
    return this.args.named.fractionDigits ? this.args.named.fractionDigits : 2;
  }

  get maskPattern(): string {
    return `num${this.args.positional[1] ? ' ' + this.args.positional[1] : ''}`;
  }

  get positionalValue(): string | undefined {
    if (this.args.positional[0] != undefined) {
      if (this.args.positional[0] instanceof Money) {
        return this.args.positional[0].toFixed(this.fractionDigits);
      } else {
        return this.args.positional[0].toString();
      }
    }

    return undefined;
  }

  onChangeHandler: () => void = () => {
    if (
      this.mask &&
      this.args.named.onChange &&
      this.mask.unmaskedValue &&
      this.positionalValue &&
      parseFloat(this.mask.unmaskedValue) !== parseFloat(this.positionalValue)
    ) {
      this.args.named.onChange(parseFloat(this.mask.unmaskedValue));
    }
  };

  didUpdateArguments(): void {
    if (this.mask) {
      if (this.positionalValue) {
        this.mask.unmaskedValue = this.positionalValue;
        this.mask.updateValue();
      }
    }
  }

  didInstall(): void {
    this.mask = IMask(this.element as HTMLElement, {
      mask: this.maskPattern,
      lazy: false,
      blocks: {
        num: {
          mask: Number,
          ...(this.args.named.min && { min: this.args.named.min }),
          ...(this.args.named.max && { max: this.args.named.max }),
          thousandsSeparator: ' ',
          scale: this.fractionDigits,
        },
      },
    }) as unknown as IMask.InputMask<MaskedPattern>;

    if (this.args.positional[0]) {
      if (this.args.positional[0] instanceof Money) {
        this.mask.unmaskedValue = this.args.positional[0].toFixed(this.fractionDigits);
      } else {
        this.mask.unmaskedValue = this.args.positional[0].toString();
      }
    }

    if (this.args.named.onChange) {
      this.mask.on('complete', this.onChangeHandler);
    }
  }

  willRemove(): void {
    if (this.mask) {
      this.mask.off('complete', this.onChangeHandler);
      this.mask.destroy();
    }
  }
}
