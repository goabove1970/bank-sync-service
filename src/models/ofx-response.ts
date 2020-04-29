import { ofxAccount } from './ofx-account';
import { ofxStatusData } from './ofx-status-data';

export interface ofxResponse {
  accounts?: ofxAccount[];
  statusData?: ofxStatusData;
}
