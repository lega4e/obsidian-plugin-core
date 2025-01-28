import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

export default class Lega4eCorePlugin extends Plugin {
	async onload() {
	  console.log('Lega4eCorePlugin loaded.');
	  this.registerApi();
	}
  
	onunload() {
	  console.log('Lega4eCorePlugin unloaded.');
	}
  
	registerApi() {
		console.log('Lega4eCorePlugin registerApi');
		(this.app as any).plugins.plugins['lega4e-core-plugin'].api = {
			sayHello: (name: string) => `Hello, ${name}!`,
			addNumbers: (a: number, b: number) => a + b,
		};
	}
  }
  
