import { useRepo } from 'pinia-orm';
import Patient from 'src/stores/models/patient/patient';
import api from '../apiService/apiService';
import moment from 'moment';

const sync_temp_patients = useRepo(Patient);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('sync_temp_patients', params)
      .then((resp) => {
        sync_temp_patients.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('sync_temp_patients?offset=' + offset + '&limit=100')
        .then((resp) => {
          sync_temp_patients.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            setTimeout(this.get(offset), 2);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('sync_temp_patients/' + id, params)
      .then((resp) => {
        sync_temp_patients.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('sync_temp_patients/' + id)
      .then(() => {
        sync_temp_patients.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return sync_temp_patients.getModel().$newInstance();
  },
  getAllFromStorage() {
    return sync_temp_patients.all();
  },

  getAllPatientWithPrescriptionDate() {
    return sync_temp_patients
    .query()
    .where((patient) => {
      return patient.prescriptionenddate !== null })
.get();
  },

  getPatientsByYear(year) {
    const startDate =  moment('01-01-'+year).format('MM-DD-YYYY')
    console.log(startDate)
    const endDate = moment('12-31-'+year).format('MM-DD-YYYY')
    console.log(endDate)
      return api()
        .get('sync_temp_patients?prescriptiondate=gt.'+startDate+'&prescriptiondate=lt.'+endDate)
        .then((resp) => {
          sync_temp_patients.save(resp.data);
        });
  },

  getPatientsByYearFromLocalStorage(year) {
   
   // const startDate =  moment('01-01-'+year).format('DD-MM-YYYY')
   const startDate = new Date('01-01-'+year)
    console.log(startDate)
  //  const endDate = moment('12-31-'+year).format('DD-MM-YYYY')
  const endDate = new Date('12-31-'+year)
    console.log(endDate)
    const patients = sync_temp_patients
    .query()
    .where((patient) => {
      return patient.prescriptiondate !== null &&
      new Date(patient.prescriptiondate)>= startDate && new Date(patient.prescriptiondate) <= endDate })
      .orderBy('prescriptionenddate','desc')
.get();
   console.log(patients)
    return patients
  },
};
