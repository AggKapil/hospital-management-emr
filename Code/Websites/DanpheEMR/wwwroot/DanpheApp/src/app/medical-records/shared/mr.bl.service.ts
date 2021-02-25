import { Injectable, Directive } from '@angular/core';
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ADT_DLService } from '../../adt/shared/adt.dl.service';
import { MR_DLService } from './mr.dl.service';
import { MedicalRecordsSummary } from './medical-records.model';
import * as _ from 'lodash';
import * as cloneDeep from 'lodash/cloneDeep';
import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import { DeathDetails } from '../../adt/shared/death.detail.model';

@Injectable()
export class MR_BLService {

  constructor(public coreService: CoreService,public msgBoxServ: MessageboxService,
    public admissionDLService: ADT_DLService, public medicalRecordsDLService: MR_DLService) {
  }

  public GetDischargedPatientsList(fromDt, toDt) {
    let admissionStatus = "discharged";
    return this.admissionDLService.GetDischargedPatientsList(admissionStatus, fromDt, toDt)
      .map(res => { return res });
  }

  public GetAllMasterDataForMR() {
    return this.medicalRecordsDLService.GetAllMasterDataForMR()
      .map(res => { return res });
  }  

  public GetAllTestsByPatIdAndVisitId(patId,visitId) {
    return this.medicalRecordsDLService.GetAllTestsByPatIdAndVisitId(patId, visitId)
      .map(res => { return res });
  }

  public GetPatientMRDetailWithMasterData(medicalRecordId, patVisitId) {
    return this.medicalRecordsDLService.GetPatientMRDetailWithMasterData(medicalRecordId, patVisitId)
      .map(res => { return res });
  }

  public GetBirthList(fromDate,toDate) {
    return this.medicalRecordsDLService.GetBirthList(fromDate, toDate)
      .map(res => { return res });
  }

  public GetDeathList(fromDate, toDate) {
    return this.medicalRecordsDLService.GetDeathList(fromDate, toDate)
      .map(res => { return res });
  }

  public GetBirthDetailForCertificate(deathDetailId) {
    return this.medicalRecordsDLService.GetBirthDetailForCertificate(deathDetailId)
      .map(res => { return res });
  }

  public GetDeathDetailForCertificate(deathDetailId) {
    return this.medicalRecordsDLService.GetDeathDetailForCertificate(deathDetailId)
      .map(res => { return res });
  }

  public PostMRofPatient(medicalRec: MedicalRecordsSummary) {
    var record = cloneDeep(medicalRec);
    record.BabyBirthDetails.forEach(br => {
      br.PatientId = record.PatientId;
      br.PatientVisitId = record.PatientVisitId;
    });
    if (!record.ShowDeathCertDetail) {
      record = _.omit(record, ['DeathDetail']);
    } else {
      record.DeathDetail.PatientId = record.PatientId;
      record.DeathDetail.PatientVisitId = record.PatientVisitId;
      record = _.omit(record, ['DeathDetail.DeathDetailsValidator', 'BirthDetail','BabyBirthDetails']);
    }

    if (!record.ShowBirthCertDetail) {
      record = _.omit(record, ['BabyBirthDetails']);
    } else {
      for (var i = 0; i < record.BabyBirthDetails.length; i++) {
        var currBrthDet = cloneDeep(record.BabyBirthDetails[i]);
        record.BabyBirthDetails[i] = null;
        record.BabyBirthDetails[i] = Object.assign({}, _.omit(currBrthDet, ['BabyBirthDetailsValidator', 'IsValid', 'IsDirty', 'IsValidCheck']));
      }
    }    

    record = _.omit(record, ['BirthDetail']);

    var str = JSON.stringify(record);

    return this.medicalRecordsDLService.PostMRofPatient(str)
      .map(res => { return res });

  }

  public PutMedicalRecord(medicalRec: MedicalRecordsSummary) {
    var record = cloneDeep(medicalRec);
    record.BabyBirthDetails.forEach(br => {
      br.PatientId = record.PatientId;
      br.PatientVisitId = record.PatientVisitId;
    });

    if (!record.IsOperationConducted) {
      record.OperationTypeId = 0;
      record.OperatedDoctor = null;
      record.OperationDate = null;
    }

    if (!record.ShowDeathCertDetail) {
      if (record.DeathDetail && record.DeathDetail.DeathId && record.DeathDetail.DeathId > 0) {
        record.DeathDetail.IsActive = false;
      } else { record = _.omit(record, ['DeathDetail']);}     
    } else {
      record.DeathDetail.PatientId = record.PatientId;
      record.DeathDetail.PatientVisitId = record.PatientVisitId;
      record = _.omit(record, ['DeathDetail.DeathDetailsValidator']);
    }

    

    if (!record.ShowBirthCertDetail) {
      //record = _.omit(record, ['BabyBirthDetails']);
      record.BabyBirthDetails = record.BabyBirthDetails.filter(b => {
        if (b.BabyBirthDetailsId) {
          return true;
        }
      });
    }

    for (var i = 0; i < record.BabyBirthDetails.length; i++) {
      var currBrthDet = cloneDeep(record.BabyBirthDetails[i]);
      record.BabyBirthDetails[i] = null;
      record.BabyBirthDetails[i] = Object.assign({}, _.omit(currBrthDet, ['BabyBirthDetailsValidator', 'IsValid', 'IsDirty', 'IsValidCheck']));
    }

    record = _.omit(record, ['BirthDetail']);

    var str = JSON.stringify(record);

    return this.medicalRecordsDLService.PutMedicalRecord(str)
      .map(res => { return res });
  }

  public PutBirthDetail(birthDet: BabyBirthDetails) {
    var detail = _.omit(birthDet, ['BabyBirthDetailsValidator']);
    let data = JSON.stringify(detail);
    return this.medicalRecordsDLService.PutBirthDetail(data)
      .map(res => { return res });
  }

  public PutBirthCertificateReportDetail(birthDet: BabyBirthDetails) {
    var detail = _.omit(birthDet, ['BabyBirthDetailsValidator']);
    let data = JSON.stringify(detail);
    return this.medicalRecordsDLService.PutBirthCertificateReportDetail(data)
      .map(res => { return res });
  }

  public PutDeathCertificateReportDetail(deathPat: DeathDetails) {
    var detail = _.omit(deathPat, ['DeathDetailsValidator']);
    let data = JSON.stringify(detail);
    return this.medicalRecordsDLService.PutDeathCertificateReportDetail(data)
      .map(res => { return res });
  }

  public PutBirthCertificatePrintDetail(birthDet: BabyBirthDetails) {
    var detail = _.omit(birthDet, ['BabyBirthDetailsValidator']);
    let data = JSON.stringify(detail);
    return this.medicalRecordsDLService.PutBirthCertificatePrintDetail(data)
      .map(res => { return res });
  }

  public PutDeathCertificatePrintDetail(deathPat: DeathDetails) {
    var detail = _.omit(deathPat, ['DeathDetailsValidator']);
    let data = JSON.stringify(detail);
    return this.medicalRecordsDLService.PutDeathCertificatePrintDetail(data)
      .map(res => { return res });
  }


}


