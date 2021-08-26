import Controller from '@ember/controller';
import { action } from '@ember/object';

import { tracked } from '@glimmer/tracking';

export default class App extends Controller {
  @tracked contribution = 1000;

  @action
  doNothing(): void {
    // Dummy action
  }

  @action
  onChange() {
    console.log(`contribution choose : ${this.contribution}`);
  }

  @action
  setContribution(value: number): void {
    this.contribution = value;
    this.onChange();
  }
}
