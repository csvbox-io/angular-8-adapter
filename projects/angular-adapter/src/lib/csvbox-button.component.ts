import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterContentInit, OnDestroy, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { insertCSS } from './utils/insertCSS';
import { buildImportUrl, generateUuid, buildInitPayload, createModalLifecycle, classifyStructuredMessage, classifyLegacyMessage } from '@csvbox/adapter';

const appVersion = '0.0.6';

@Component({
	selector: 'csvbox-button',
	template: `
    <div>
      <button data-csvbox [disabled]="disabled" (click)="openModal()" [attr.data-csvbox-token]="uuid">
        <ng-content></ng-content>
      </button>
    </div>
  `
})

export class CSVBoxButtonComponent implements OnInit, OnChanges, AfterContentInit, OnDestroy {

	@Input() onImport?: Function;
	@Input() onReady?: Function;
	@Input() onClose?: Function;
	@Input() onSubmit?: Function;
	@Input() loadStarted?: Function;

	@Input() user?: object;
	@Input() dynamicColumns?: object;
	@Input() licenseKey: string | null = null;
	@Input() options?: object;
	@Input() uuid: string | null = null;
	@Input() customDomain: string | null = null;
	@Input() dataLocation: string | null = null;
	@Input() language: string | null = null;
	@Input() environment?: object;
	@Input() theme: string | null = null;

	@Input() lazy: boolean = false;

	safeUrl: any;

	iframe: HTMLIFrameElement | null = null;

	@Input() disabled: boolean = true;

	constructor(public sanitizer: DomSanitizer) { }

	holder: any;
	lifecycle = createModalLifecycle();

	ngOnInit(): void {
		this.uuid = generateUuid();
		let iframeUrl = buildImportUrl(
			{
				licenseKey: this.licenseKey,
				customDomain: this.customDomain,
				dataLocation: this.dataLocation,
				language: this.language,
				theme: this.theme,
				environment: this.environment
			},
			"angular",
			appVersion
		);
		this.safeUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl));
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes["user"] && changes['user'].currentValue != changes['user'].previousValue) {
			this.updateUserVariable(changes['user'].currentValue);
		}
	}

	updateUserVariable(data: any): void {
		this.user = data;
		if (this.iframe && this.iframe.contentWindow) {
			this.iframe.contentWindow.postMessage({
				"customer": data
			}, "*");
		}
	}

	private messageListener = (event: MessageEvent) => {
		let legacy = classifyLegacyMessage(event.data);
		if (legacy) {
			if (legacy.type === "mainModalHidden") {
				this.handleModalClosed();
			}
			if (legacy.type === "uploadSuccessful") {
				if (this.onImport) this.onImport(true);
			}
			if (legacy.type === "uploadFailed") {
				if (this.onImport) this.onImport(false);
			}
			return;
		}

		let message = classifyStructuredMessage(event.data, this.uuid!);
		if (!message) {
			return;
		}

		if (message.type === "data-on-submit") {
			if (this.onSubmit) this.onSubmit(message.metadata);
		} else if (message.type === "data-push-status") {
			if (this.onImport) this.onImport(message.success, message.metadata);
		} else if (message.type === "csvbox-modal-hidden") {
			this.handleModalClosed();
		} else if (message.type === "csvbox-upload-successful") {
			if (this.onImport) this.onImport(true);
		} else if (message.type === "csvbox-upload-failed") {
			if (this.onImport) this.onImport(false);
		}
	};

	ngAfterContentInit(): void {
		window.addEventListener("message", this.messageListener, false);

		if (this.lazy) {
			this.disabled = false;
		} else {
			this.disabled = true;
			this.initImporter();
		}
	}

	ngOnDestroy(): void {
		window.removeEventListener("message", this.messageListener);
	}

	handleModalClosed(): void {
		this.lifecycle.markClosed();
		if (this.holder) {
			this.holder.remove();
		}
		this.holder = null;
		this.iframe = null;
		if (this.onClose) this.onClose();
	}

	initImporter() {
		if (this.loadStarted) this.loadStarted();

		this.uuid = generateUuid();

		insertCSS();

		let iframe = document.createElement("iframe");
		this.iframe = iframe;
		iframe.setAttribute("src", this.safeUrl);
		iframe.frameBorder = "0";

		iframe.onload = () => {
			if (this.onReady) this.onReady();

			this.disabled = false;
			if (this.iframe && this.iframe.contentWindow) {
				this.iframe.contentWindow.postMessage(buildInitPayload(this.user, this.dynamicColumns, this.options, this.uuid!), "*");
			}
			if (this.lifecycle.markReady()) {
				this.openModal();
			}
		}

		this.holder = document.createElement('div');
		this.holder.classList.add('csvbox-holder');
		this.holder.setAttribute('id', `csvbox-embed-${this.uuid}`);
		this.holder.appendChild(iframe);

		document.body.insertAdjacentElement(
			'beforeend', this.holder
		);
	}

	openModal(): void {
		if (!this.iframe) {
			this.lifecycle.requestOpen();
			this.initImporter();
			return;
		}
		if (this.lifecycle.requestOpen()) {
			if (this.holder) this.holder.style.display = 'block';
			if (this.iframe && this.iframe.contentWindow) {
				this.iframe.contentWindow.postMessage('openModal', '*');
			}
		}
	}

}
