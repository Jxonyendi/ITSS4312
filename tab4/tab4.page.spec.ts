import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderPage } from './tab4.page';

describe('OrderPage', () => {
  let component: OrderPage;
  let fixture: ComponentFixture<OrderPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(OrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
