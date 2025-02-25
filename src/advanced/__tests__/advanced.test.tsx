import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, Mock, test, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { CartPage } from '../../refactoring/components/CartPage';
import { AdminPage } from '../../refactoring/components/AdminPage';
import { CartItem, Coupon, Product } from '../../types';
import { useLocalStorage } from '../../refactoring/hooks';
import * as cartUtils from '../../refactoring/models/cart';
import { L } from 'vitest/dist/chunks/reporters.C4ZHgdxQ.js';

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: '상품1',
    price: 10000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.1 }],
  },
  {
    id: 'p2',
    name: '상품2',
    price: 20000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.15 }],
  },
  {
    id: 'p3',
    name: '상품3',
    price: 30000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.2 }],
  },
];
const mockCoupons: Coupon[] = [
  {
    name: '5000원 할인 쿠폰',
    code: 'AMOUNT5000',
    discountType: 'amount',
    discountValue: 5000,
  },
  {
    name: '10% 할인 쿠폰',
    code: 'PERCENT10',
    discountType: 'percentage',
    discountValue: 10,
  },
];

const TestAdminPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleProductAdd = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const handleCouponAdd = (newCoupon: Coupon) => {
    setCoupons((prevCoupons) => [...prevCoupons, newCoupon]);
  };

  return (
    <AdminPage
      products={products}
      coupons={coupons}
      onProductUpdate={handleProductUpdate}
      onProductAdd={handleProductAdd}
      onCouponAdd={handleCouponAdd}
    />
  );
};

describe('advanced > ', () => {
  describe('시나리오 테스트 > ', () => {
    test('장바구니 페이지 테스트 > ', async () => {
      render(<CartPage products={mockProducts} coupons={mockCoupons} />);
      const product1 = screen.getByTestId('product-p1');
      const product2 = screen.getByTestId('product-p2');
      const product3 = screen.getByTestId('product-p3');
      const addToCartButtonsAtProduct1 = within(product1).getByText('장바구니에 추가');
      const addToCartButtonsAtProduct2 = within(product2).getByText('장바구니에 추가');
      const addToCartButtonsAtProduct3 = within(product3).getByText('장바구니에 추가');

      // 1. 상품 정보 표시
      expect(product1).toHaveTextContent('상품1');
      expect(product1).toHaveTextContent('10,000원');
      expect(product1).toHaveTextContent('재고: 20개');
      expect(product2).toHaveTextContent('상품2');
      expect(product2).toHaveTextContent('20,000원');
      expect(product2).toHaveTextContent('재고: 20개');
      expect(product3).toHaveTextContent('상품3');
      expect(product3).toHaveTextContent('30,000원');
      expect(product3).toHaveTextContent('재고: 20개');

      // 2. 할인 정보 표시
      expect(screen.getByText('10개 이상: 10% 할인')).toBeInTheDocument();

      // 3. 상품1 장바구니에 상품 추가
      fireEvent.click(addToCartButtonsAtProduct1); // 상품1 추가

      // 4. 할인율 계산
      expect(screen.getByText('상품 금액: 10,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 0원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 10,000원')).toBeInTheDocument();

      // 5. 상품 품절 상태로 만들기
      for (let i = 0; i < 19; i++) {
        fireEvent.click(addToCartButtonsAtProduct1);
      }

      // 6. 품절일 때 상품 추가 안 되는지 확인하기
      expect(product1).toHaveTextContent('재고: 0개');
      fireEvent.click(addToCartButtonsAtProduct1);
      expect(product1).toHaveTextContent('재고: 0개');

      // 7. 할인율 계산
      expect(screen.getByText('상품 금액: 200,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 20,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 180,000원')).toBeInTheDocument();

      // 8. 상품을 각각 10개씩 추가하기
      fireEvent.click(addToCartButtonsAtProduct2); // 상품2 추가
      fireEvent.click(addToCartButtonsAtProduct3); // 상품3 추가

      const increaseButtons = screen.getAllByText('+');
      for (let i = 0; i < 9; i++) {
        fireEvent.click(increaseButtons[1]); // 상품2
        fireEvent.click(increaseButtons[2]); // 상품3
      }

      // 9. 할인율 계산
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 110,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 590,000원')).toBeInTheDocument();

      // 10. 쿠폰 적용하기
      const couponSelect = screen.getByRole('combobox');
      fireEvent.change(couponSelect, { target: { value: '1' } }); // 10% 할인 쿠폰 선택

      // 11. 할인율 계산
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 169,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 531,000원')).toBeInTheDocument();

      // 12. 다른 할인 쿠폰 적용하기
      fireEvent.change(couponSelect, { target: { value: '0' } }); // 5000원 할인 쿠폰
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 115,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 585,000원')).toBeInTheDocument();
    });

    test('관리자 페이지 테스트 > ', async () => {
      render(<TestAdminPage />);

      const $product1 = screen.getByTestId('product-1');

      // 1. 새로운 상품 추가
      fireEvent.click(screen.getByText('새 상품 추가'));

      fireEvent.change(screen.getByLabelText('상품명'), { target: { value: '상품4' } });
      fireEvent.change(screen.getByLabelText('가격'), { target: { value: '15000' } });
      fireEvent.change(screen.getByLabelText('재고'), { target: { value: '30' } });

      fireEvent.click(screen.getByText('추가'));

      const $product4 = screen.getByTestId('product-4');

      expect($product4).toHaveTextContent('상품4');
      expect($product4).toHaveTextContent('15000원');
      expect($product4).toHaveTextContent('재고: 30');

      // 2. 상품 선택 및 수정
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId('toggle-button'));
      fireEvent.click(within($product1).getByTestId('modify-button'));

      act(() => {
        fireEvent.change(within($product1).getByDisplayValue('20'), { target: { value: '25' } });
        fireEvent.change(within($product1).getByDisplayValue('10000'), {
          target: { value: '12000' },
        });
        fireEvent.change(within($product1).getByDisplayValue('상품1'), {
          target: { value: '수정된 상품1' },
        });
      });

      fireEvent.click(within($product1).getByText('수정 완료'));

      expect($product1).toHaveTextContent('수정된 상품1');
      expect($product1).toHaveTextContent('12000원');
      expect($product1).toHaveTextContent('재고: 25');

      // 3. 상품 할인율 추가 및 삭제
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId('modify-button'));

      // 할인 추가
      act(() => {
        fireEvent.change(screen.getByPlaceholderText('수량'), { target: { value: '5' } });
        fireEvent.change(screen.getByPlaceholderText('할인율 (%)'), { target: { value: '5' } });
      });
      fireEvent.click(screen.getByText('할인 추가'));

      expect(screen.queryByText('5개 이상 구매 시 5% 할인')).toBeInTheDocument();

      // 할인 삭제
      fireEvent.click(screen.getAllByText('삭제')[0]);
      expect(screen.queryByText('10개 이상 구매 시 10% 할인')).not.toBeInTheDocument();
      expect(screen.queryByText('5개 이상 구매 시 5% 할인')).toBeInTheDocument();

      fireEvent.click(screen.getAllByText('삭제')[0]);
      expect(screen.queryByText('10개 이상 구매 시 10% 할인')).not.toBeInTheDocument();
      expect(screen.queryByText('5개 이상 구매 시 5% 할인')).not.toBeInTheDocument();

      // 4. 쿠폰 추가
      fireEvent.change(screen.getByPlaceholderText('쿠폰 이름'), { target: { value: '새 쿠폰' } });
      fireEvent.change(screen.getByPlaceholderText('쿠폰 코드'), { target: { value: 'NEW10' } });
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'percentage' } });
      fireEvent.change(screen.getByPlaceholderText('할인 값'), { target: { value: '10' } });

      fireEvent.click(screen.getByText('쿠폰 추가'));

      const $newCoupon = screen.getByTestId('coupon-3');

      expect($newCoupon).toHaveTextContent('새 쿠폰 (NEW10):10% 할인');
    });
  });

  describe('자유롭게 작성해보세요.', () => {
    // 유틸 함수 테스트 코드
    describe('cartUtils', () => {
      const testProduct: Product = {
        id: '1',
        name: 'Test Product',
        price: 100,
        stock: 10,
        discounts: [
          { quantity: 2, rate: 0.1 },
          { quantity: 5, rate: 0.2 },
        ],
      };

      describe('updateItemQuantity', () => {
        const cart: CartItem = { product: testProduct, quantity: 2 };

        test('수량이 정상적으로 업데이트되어야 합니다.', () => {
          const updatedCart = cartUtils.updateItemQuantity(cart, 5);
          expect(updatedCart).toEqual({ ...updatedCart, quantity: 5 });
        });

        test('수량이 0일 경우에 null을 반환해야 합니다.', () => {
          const updatedCart = cartUtils.updateItemQuantity(cart, 0);
          expect(updatedCart).toBeNull();
        });

        test('수량이 재고 한도를 초과하지 않아야 합니다.', () => {
          const updatedCart = cartUtils.updateItemQuantity(cart, 15);
          expect(updatedCart).toEqual({ ...updatedCart, quantity: 10 });
        });

        test('수량이 음수인 경우 null을 반환해야 합니다.', () => {
          const updatedCart = cartUtils.updateItemQuantity(cart, -1);
          expect(updatedCart).toBeNull();
        });
      });

      describe('applyCouponDiscount', () => {
        test('금액 쿠폰을 올바르게 적용해야 합니다.', () => {
          const coupon: Coupon = {
            name: 'Test Coupon',
            code: 'TEST',
            discountType: 'amount',
            discountValue: 50,
          };
          const result = cartUtils.applyCouponDiscount(400, 450, coupon);
          expect(result.totalAfterDiscount).toBe(350); // 400 - 50
          expect(result.totalDiscount).toBe(100); // 450 - 350
        });

        test('퍼센트 쿠폰을 올바르게 적용해야 합니다.', () => {
          const coupon: Coupon = {
            name: 'Test Coupon',
            code: 'TEST',
            discountType: 'percentage',
            discountValue: 10,
          };
          const result = cartUtils.applyCouponDiscount(400, 450, coupon);
          expect(result.totalAfterDiscount).toBe(360); // 400 * 0.9
          expect(result.totalDiscount).toBe(90); // 450 - 360
        });
      });

      describe('calculateCartTotal', () => {
        const cart: CartItem[] = [
          { product: testProduct, quantity: 2 },
          { product: { ...testProduct, id: '2', price: 200 }, quantity: 1 },
        ];

        test('쿠폰 없이 총액을 올바르게 계산해야 합니다.', () => {
          const result = cartUtils.calculateCartTotal(cart, null);
          expect(result.totalBeforeDiscount).toBe(400);
          expect(result.totalAfterDiscount).toBe(380);
          expect(result.totalDiscount).toBe(20);
        });

        test('금액 쿠폰을 올바르게 적용해야 합니다.', () => {
          const coupon: Coupon = {
            name: 'Test Coupon',
            code: 'TEST',
            discountType: 'amount',
            discountValue: 50,
          };
          const result = cartUtils.calculateCartTotal(cart, coupon);
          expect(result.totalAfterDiscount).toBe(330);
          expect(result.totalDiscount).toBe(70);
        });

        test('퍼센트 쿠폰을 올바르게 적용해야 합니다', () => {
          const coupon: Coupon = {
            name: 'Test Coupon',
            code: 'TEST',
            discountType: 'percentage',
            discountValue: 10,
          };
          const result = cartUtils.calculateCartTotal(cart, coupon);
          expect(result.totalAfterDiscount).toBe(342);
          expect(result.totalDiscount).toBe(58);
        });
      });
    });

    // 커스텀 훅 테스트 코드
    describe('useLocalStorage', () => {
      const key = 'testKey';
      const initialValue = { name: 'Test', quantity: 1 };

      beforeEach(() => {
        vi.stubGlobal('localStorage', {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        });
      });

      afterEach(() => {
        vi.clearAllMocks();
      });

      test('초기값이 올바르게 설정되어야 합니다.', () => {
        (localStorage.getItem as Mock).mockReturnValueOnce(null);
        const { result } = renderHook(() => useLocalStorage(key, initialValue));

        expect(result.current.storedItem).toEqual(initialValue);
        expect(localStorage.getItem).toHaveBeenCalledWith(key);
      });

      test('로컬 스토리지에 데이터가 있으면 해당 값을 반환해야 합니다.', () => {
        const storedValue = JSON.stringify({ name: 'stored', quantity: 2 });
        (localStorage.getItem as Mock).mockReturnValueOnce(storedValue);
        const { result } = renderHook(() => useLocalStorage(key, initialValue));

        expect(result.current.storedItem).toEqual(JSON.parse(storedValue));
        expect(localStorage.getItem).toHaveBeenCalledWith(key);
      });

      test('setCartItem 호출 시 상태와 로컬 스토리지가 업데이트 되어야 합니다.', () => {
        const { result } = renderHook(() => useLocalStorage(key, initialValue));

        const newValue = { name: 'Updated', quantity: 3 };
        act(() => {
          result.current.setCartItem(newValue);
        });

        expect(result.current.storedItem).toEqual(newValue);
        expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(newValue));
      });

      test('updateCartItem 호출 시 상태와 로컬 스토리지가 병합되어야 합니다.', () => {
        const initial = { name: 'initial', quantity: 1 };
        (localStorage.getItem as Mock).mockReturnValueOnce(JSON.stringify(initial));

        const { result } = renderHook(() => useLocalStorage(key, initial));
        act(() => {
          result.current.updateCartItem({ quantity: 5 });
        });

        const updatedValue = { name: 'initial', quantity: 5 };
        expect(result.current.storedItem).toEqual(updatedValue);
        expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(updatedValue));
      });
    });
  });
});
