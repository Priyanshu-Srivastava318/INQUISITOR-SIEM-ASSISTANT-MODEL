// Complaints/Incidents Management
const Complaints = {
    incidents: [],
    
    createIncident(data) {
        const incident = {
            id: `INC-${new Date().getFullYear()}-${String(this.incidents.length + 1).padStart(3, '0')}`,
            ...data,
            createdAt: new Date().toISOString(),
            status: 'Open'
        };
        
        this.incidents.push(incident);
        return incident;
    },
    
    getAllIncidents() {
        return this.incidents;
    },
    
    getIncidentById(id) {
        return this.incidents.find(inc => inc.id === id);
    },
    
    updateIncidentStatus(id, status) {
        const incident = this.getIncidentById(id);
        if (incident) {
            incident.status = status;
            incident.updatedAt = new Date().toISOString();
        }
        return incident;
    }
};