export interface SignUpData {
  email: string;
  password: string;
  name: string;
  username: string;
  accountType: 'business' | 'user';
  businessType?: 'food' | 'retail' | 'service';
}

export interface SignInData {
  email: string;
  password: string;
}
