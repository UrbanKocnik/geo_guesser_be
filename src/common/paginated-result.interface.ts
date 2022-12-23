export class PaginatedResult{
    page_data: any[]; 
    meta: {
        total_entries:number,
        page:number, 
        last_page:number}
}