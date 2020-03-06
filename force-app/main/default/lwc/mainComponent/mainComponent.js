import { LightningElement, track} from 'lwc';

export default class MainComponent extends LightningElement {
    @track selectedValue='';
    @track selectedOffset=0;
    @track recordSize;

    handleSearchText(event){
        console.log('event fired');
        this.selectedValue = event.detail;
    }
    setRecordSize(event){
        this.recordSize = event.detail;
        console.log(this.recordSize);
    }
    handlePageChange(event){
        this.selectedOffset = event.detail;
    }
}