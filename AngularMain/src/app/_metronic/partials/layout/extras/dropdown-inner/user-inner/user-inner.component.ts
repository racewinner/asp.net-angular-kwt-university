import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { TranslationService } from '../../../../../../modules/i18n';
import { AuthService, UserType } from '../../../../../../modules/auth';
import { LoginService } from 'src/app/modules/_services/login.service';

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  language: LanguageFlag;
  user$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  langs = languages;

  languages = [
    {
      lang: 'en',
      name: 'English',
      flag: 'assets/media/flags/united-states.svg',
    },
    {
      lang: 'ar',
      name: 'Arabic',
      flag: 'assets/media/flags/kuwait.svg',
    }
  ];
  
  private unsubscribe: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private translationService: TranslationService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.setLanguage('en'); // Set the default language
    this.isLoading$ = this.loginService.isLoading$;
  }
  

  selectLanguage(lang: string) {
    this.translationService.setLanguage(lang);
    this.setLanguage(lang);
    document.location.reload();
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }
  
 logout(){
  const tenantId = JSON.parse(localStorage.getItem('user') || '{}').tenantId;
  this.loginService.RefreshUpdatedData(tenantId).subscribe((res:any)=>{
    console.log(res);
  })
  setTimeout(()=>{
    this.auth.logout(); 
    this.loginService.isLoading = false;
    localStorage.setItem('lang', 'en')
    localStorage.setItem('langType', '1')
  })  
 }
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: 'assets/media/flags/united-states.svg',
  },
  {
    lang: 'ar',
    name: 'Arabic',
    flag: 'assets/media/flags/kuwait.svg',
  }
];
