export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  createdBy?: string;
  assignedTo?: string;
}