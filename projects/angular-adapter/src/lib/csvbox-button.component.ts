import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'csvbox-button',
  template: `
    <div>
      <button data-csvbox (click)="openModal()">
        <ng-content></ng-content>
      </button>
      <div #holder class="holder">
        <iframe #iframe class="iframe" [src]="safeUrl"></iframe>
      </div>
    </div>
  `,
  styles: [
    `
      .holder{
        z-index: 2147483647;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: none;
      }
      .iframe{
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0px;
        left: 0px;
      }
    `
  ]
})

export class CSVBoxButtonComponent implements OnInit {

  isModalShown = false;

  @ViewChild('holder', {static: true}) holder: any;
  @ViewChild('iframe', {static: true}) iframe: any;
  @Input() onImport: Function;
  @Input() user: Object;
  @Input() dynamicColumns: Object;
  @Input() licenseKey: String;
  @Input() options: Object;

  safeUrl:SafeUrl;

  constructor(public sanitizer:DomSanitizer) {}

  ngOnInit(): void {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl("https://app.csvbox.io/embed/" + this.licenseKey);
  }

  ngAfterViewInit(): void {

    if(document.querySelector("[data-csvbox]") != null){
      document.onreadystatechange = () => {
          if (document.readyState === 'complete') {
            (document.querySelector("[data-csvbox]") as HTMLButtonElement).disabled = false;
          }else{
            (document.querySelector("[data-csvbox]") as HTMLButtonElement).disabled = true;
          }
      };
    }

    window.addEventListener("message", (event) => {
      if (event.data === "mainModalHidden") {
          this.holder.nativeElement.style.display = 'none';
          this.isModalShown = false;
      }
      if(event.data === "uploadSuccessful") {
        this.onImport(true);
      }
      if(event.data === "uploadFailed") {
        this.onImport(false);
      }
      if(typeof event.data == "object") {
          if(event.data.type && event.data.type == "data-push-status") {
            if(event.data.data.import_status = "success"){
              this.onImport(true, event.data.data);
            }else {
              this.onImport(false, event.data.data);
            }
          }
      }
    }, false);

    let iframe = this.iframe.nativeElement;
    let user = this.user;
    let dynamicColumns = this.dynamicColumns;
    let options = this.options;

    iframe.onload = function () {
      if(user) {
        iframe.contentWindow.postMessage({
          "customer" : user
        }, "*");
      }
      if(dynamicColumns){
        iframe.contentWindow.postMessage({
          "columns" : dynamicColumns
        }, "*");
      }
      if(options) {
        iframe.contentWindow.postMessage({
          "options" : options
        }, "*");
      }
    }

  }

  openModal(): void {
    if(!this.isModalShown) {
      this.isModalShown = true;
      console.log(this.iframe.nativeElement);
      this.iframe.nativeElement.contentWindow.postMessage('openModal', '*');
      this.holder.nativeElement.style.display = 'block';
    }
  }

}
