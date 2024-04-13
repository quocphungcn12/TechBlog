import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  templateUrl: './validation-message.component.html',
})
export class ValidationMessageComponent {
  @Input() entityForm: FormGroup;
  @Input() fieldName: string;
  @Input() validationMessages: any;

  constructor() {}
}
