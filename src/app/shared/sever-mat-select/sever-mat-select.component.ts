import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { ReplaySubject, Subject, filter, tap, takeUntil } from "rxjs";

@Component({
  selector: "app-sever-mat-select",
  templateUrl: "./sever-mat-select.component.html",
  styleUrls: ["./sever-mat-select.component.css"],
})
export class SeverMatSelectComponent {
  @Output() eventSearch: EventEmitter<any> = new EventEmitter();
  @Output() eventSelectedOption: EventEmitter<any> = new EventEmitter();
  @Input() disabled: boolean = false;
  @Input() initialValue?: any;
  @Input() data: any[] = [];
  @Input() pathPropertyOfObjectDisplay: string;
  @Input() placeholder: string;
  @Input() allowNullValue: boolean = false;
  /** list of banks */
  protected banks: any[] = [];

  /** control for the selected bank for server side filtering */
  public bankServerSideCtrl: FormControl = new FormControl();

  /** control for filter for server side. */
  public bankServerSideFilteringCtrl: FormControl = new FormControl();

  /** indicate search operation is in progress */
  public searching: boolean = false;

  /** list of banks filtered after simulating server side search */
  public filteredServerSideBanks: ReplaySubject<any[]> = new ReplaySubject<
    any[]
  >(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  ngOnInit() {
    if (this.initialValue) {
      this.filteredServerSideBanks.next([this.initialValue]);
      this.bankServerSideCtrl.patchValue(this.initialValue);
    }
    // listen for search field value changes
    this.bankServerSideFilteringCtrl.valueChanges
      .pipe(
        filter((search) => !!search),
        tap(() => (this.searching = true)),
        takeUntil(this._onDestroy)
      )
      .subscribe(
        (text) => {
          this.searching = false;
          if (text || text !== "") {
            this.eventSearch.emit(text);
          }
        },
        (error) => {
          // no errors in our simulated example
          this.searching = false;
          // handle error...
        }
      );
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  accessToPropertyObject(path: string, object: any) {
    return path.split(".").reduce((o, i) => o[i], object);
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.filteredServerSideBanks.next(this.data);
  }
  selectOption(data: any) {
    this.eventSelectedOption.emit(data);
  }
}
