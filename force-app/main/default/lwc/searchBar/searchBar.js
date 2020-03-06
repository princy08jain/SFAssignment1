import { LightningElement, api } from 'lwc';


export default class SearchBar extends LightningElement {
    searchTerm = '';
    selectedValue='';
    handleSearchTermChange(event){    
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            var searchTerm = event.target.value;
            const selectEvent = new CustomEvent('searchtext', {
                detail: searchTerm
            });
            this.dispatchEvent(selectEvent);
        }
    }
}