export interface ResumeParsingResult {
  result: Result;
}

interface Result {
  birthday: string | null;
  lastEducationDegree: Vector | null;
  lastEducationEndDate: string | null;
  lastEducationInstitution: Vector | null;
  lastEducationMajor: Vector | null;
  lastEducationStartDate: string | null;
  name: string | null;
  skills: Vector[];
}

interface Vector {
  name: string;
  vector: number[];
}
