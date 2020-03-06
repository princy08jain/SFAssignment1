public with sharing class OpportunityController {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpptyList(String searchTerm) {
        if(String.isBlank(searchTerm))
            return [SELECT Id, Name, Account.Name, StageName, Amount, CloseDate FROM Opportunity];
        searchTerm = '%'+searchTerm+'%';
        return [SELECT Id, Name, Account.Name, StageName, Amount, CloseDate FROM Opportunity 
                WHERE Name LIKE :searchTerm];
    }

    @AuraEnabled
    public static Integer getTotalRecords(String searchTerm){
        if(String.isBlank(searchTerm))
            return [SELECT count(Id) CloseDate FROM Opportunity].size();
        searchTerm = '%'+searchTerm+'%';
        return [SELECT count(Id) FROM Opportunity 
                WHERE Name LIKE :searchTerm].size();    
    }
}
