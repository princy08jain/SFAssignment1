import { LightningElement, track, wire, api} from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOpptyList from '@salesforce/apex/OpportunityController.getOpptyList';
import getTotalRecords from '@salesforce/apex/OpportunityController.getTotalRecords';
import ID_FIELD from '@salesforce/schema/Opportunity.Id';

const columns = [
    { label: 'Opportunity', fieldName:'Name', type:'text', sortable:'true', editable: 'true'},
    { label: 'Account', fieldName:'Account.Name', type:'text', sortable:'true'},
    { label: 'Stage', fieldName:'StageName', type:'text', sortable:'true', editable: 'true'},
    { label: 'Closed Date', fieldName:'CloseDate', type:'date-local', 
        typeAttributes:{
            month: '2-digit',
            day: '2-digit'
        },
        sortable:'true', editable: 'true'
    },
    { label: 'Amount', fieldName:'Amount', type:'currency', 
        typeAttributes:{
            currencyCode: 'INR'
        },
        sortable:'true', editable: 'true'
    }
];
const opptys = [];


export default class OpportunityResults extends LightningElement {
    @track columns = columns;
    @track data;
    @track sortBy;
    @track sortDirection;
    @track error;
    @api valueToSearch;
    @track draftValues = [];
    @track fulldata;
    @track currentPageNumber;
    @track pageSize;
    @track totalPages;
    @track pageList;

    @wire(getOpptyList, ({searchTerm: '$valueToSearch'}))
    opptys(result) {
        if (result.data) {
            this.fulldata = result.data;
            console.log(this.fulldata.length);
            this.totalPages = Math.ceil(this.fulldata.length/this.pageSize);
            this.error = undefined; 
        } else if (result.error) {
            this.error =  'Error in retrieving opportunities: '+result.error;
            this.fulldata = undefined;
        }
        this.buildData()
        /*console.log('paginating..');
        if(this.data){
            console.log('this.totalRecords');
                console.log(this.totalRecords.data);
            //dispatch event for pagination
            const paginateEvent = new CustomEvent('paginate', {
                
                detail: this.totalRecords
            });
            this.dispatchEvent(paginateEvent);
       }*/
    }
    
    connectedCallback(){
        this.currentPageNumber =1;
        this.pageSize=10;
    }
    updateColumnSorting(event) {
        var fieldName = event.detail.fieldName;
        var sortDirection = event.detail.sortDirection;
        console.log('fieldName'+fieldName);
        console.log('sortDirection'+sortDirection);
        // assign the latest attribute with the sorted column fieldName and sorted direction
        this.sortBy = fieldName;
        this.sortDirection = sortDirection;
        this.sortData(fieldName, sortDirection);
    }
    sortData(fieldName, sortDirection){
        let parseData = JSON.parse(JSON.stringify(this.fulldata));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldName];
        };
        console.log('keyValue'+keyValue);
        // cheking reverse direction
        let isReverse = sortDirection === 'asc' ? 1: -1;
        console.log('isReverse'+isReverse);
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.fulldata = parseData;
        this.currentPageNumber=1;
        this.buildData();
    }
    handleSave(event) {
        console.log(event.detail.draftValues);
        //TODO: get the id here

        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            console.log(this.data);
            console.log(draft);
            const fields = Object.assign({}, draft);
            return { fields };
        });
        console.log('recordInputs:');
        console.log(recordInputs);
    
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        console.log(promises);
        Promise.all(promises).then(opptys => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Opportunities updated',
                    variant: 'success'
                })
            );
             // Clear all draft values
             this.draftValues = [];
    
             // Display fresh data in the datatable
             return refreshApex(this.data);
        }).catch(error => {
            // Handle error
        });
    }
    generatePageList(){
        var pageNumber = parseInt(this.currentPageNumber);
        console.log('pageNumber:'+pageNumber);
        var pageList = [];
        var totalPages = this.totalPages;
        console.log('totalPages:'+totalPages);
        if(totalPages > 1){
            if(totalPages <= 10){
                var counter = 2;
                for(; counter < (totalPages); counter++){
                    pageList.push(counter);
                } 
            } else{
                if(pageNumber < 5){
                    pageList.push(2, 3, 4, 5, 6);
                } else{
                    if(pageNumber>(totalPages-5)){
                        pageList.push(totalPages-5, totalPages-4, totalPages-3, totalPages-2, totalPages-1);
                    } else{
                        pageList.push(pageNumber-2, pageNumber-1, pageNumber, pageNumber+1, pageNumber+2);
                    }
                }
            }
        }
        this.pageList = pageList;
        console.log(pageList);
    }
    buildData(){
        this.data = [];
        var pageNumber = this.currentPageNumber;
        var pageSize = this.pageSize;
        var allData = this.fulldata;
        var x = (pageNumber-1)*pageSize;
        
        //creating data-table data
        for(; x<=(pageNumber)*pageSize; x++){
            if(allData[x]){
            	this.data.push(allData[x]);
            }
        }
        this.generatePageList();
    }
    onFirst(event){
        this.currentPageNumber=1;
        this.buildData();
    }
    onPrev(event){
        var pageNumber = this.currentPageNumber;
        this.currentPageNumber = pageNumber-1;
        this.buildData();
    }
    processMe(event) {
        this.currentPageNumber = parseInt(event.target.name);
        this.buildData();
    }
    onNext(event){
        this.currentPageNumber=this.currentPageNumber+1;
        this.buildData();
    }
    onLast() {        
        this.currentPageNumber = this.totalPages;
        this.buildData();
    }
}