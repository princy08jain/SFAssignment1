import { LightningElement, track, api } from 'lwc';

export default class Pagination extends LightningElement {
    @track pages;
    @api totalRecords;
    @api pageSize;

    connectedCallback(){
        var _noOfPages = Math.ceil(this.totalRecords/this.pageSize);
        console.log('_noOfPages'+ _noOfPages);
        this.pages = [];
        //calculate no of pages
        var i;
        for (i = 0; i < _noOfPages; i++) {
            this.pages.push({number: i+1});   
        }
    }
    pageChanged(event){
        var _offset =  (event.target.label-1)*10;
        //generate an event pageChanged
        const pageChangeEvent = new CustomEvent('pagechange', {
            detail: _offset
        });
        this.dispatchEvent(pageChangeEvent);
    }
}