# @csvbox/angular

> Angular 8 adapter for csvbox.io

[![NPM](https://img.shields.io/npm/v/@csvbox/angular.svg)](https://www.npmjs.com/package/@csvbox/angular) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Shell

```bash
npm install @csvbox/angular
```

## Import
Add `CSVBoxAngularModule` to your module imports
```ts
import { CSVBoxAngularModule } from "@csvbox/angular";

@NgModule({
  ...
  imports: [
    ...
    CSVBoxAngularModule
  ]
})
```

## Usage

```html
<csvbox-button [licenseKey]="licenseKey" [onImport]="onData.bind(this)" [user]="user">Import</csvbox-button>
```

## Example

```ts
import { CSVBoxMethods } from "@csvbox/angular"

@Component({
  selector: 'app-root',
  template: `
    <csvbox-button
      [licenseKey]="licenseKey"
      [user]="user"
      [onImport]="onData.bind(this)">
      Import
    </csvbox-button>
  `
})

export class AppComponent implements CSVBoxMethods {

  title = 'example';
  licenseKey = 'YOUR_LICENSE_KEY_HERE';
  user = { user_id: 'default123' };

  onData(result: boolean, data: any) {
    if(result) {
      console.log("Sheet uploaded successfully");
      console.log(data.row_success + " rows uploaded");
    }else{
      console.log("There was some problem uploading the sheet");
    }
  }

}
```

## Readme

For usage see the guide here - https://help.csvbox.io/getting-started#2-install-code


## License

MIT © [csvbox-io](https://github.com/csvbox-io)
