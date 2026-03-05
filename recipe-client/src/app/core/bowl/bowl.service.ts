import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BowlResponse} from './bowl.models';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BowlService {
  private readonly http = inject(HttpClient);

  public getBowl(): Observable<BowlResponse> {
    return this.http.get<BowlResponse>('/api/bowl');
  }
}
