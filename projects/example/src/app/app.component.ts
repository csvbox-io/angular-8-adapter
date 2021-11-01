import { Component } from '@angular/core';
import { CSVBoxMethods } from "angular-adapter"


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
