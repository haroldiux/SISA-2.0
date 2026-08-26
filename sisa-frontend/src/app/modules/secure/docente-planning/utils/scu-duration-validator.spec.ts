import { ScuDurationValidator } from './scu-duration-validator';

describe('ScuDurationValidator', () => {

  it('should validate exact 180 minutes balance (25 + 100 + 55 = 180)', () => {
    const result = ScuDurationValidator.validate(25, 100, 55, 180);

    expect(result.isValid).toBeTrue();
    expect(result.status).toBe('VALIDO');
    expect(result.sum).toBe(180);
    expect(result.difference).toBe(0);
    expect(result.message).toContain('180 / 180 min - Balance Válido');
  });

  it('should detect excess duration (+20 min when 30 + 110 + 60 = 200)', () => {
    const result = ScuDurationValidator.validate(30, 110, 60, 180);

    expect(result.isValid).toBeFalse();
    expect(result.status).toBe('EXCESO');
    expect(result.sum).toBe(200);
    expect(result.difference).toBe(20);
    expect(result.message).toContain('Exceso: +20 min (Total: 200 min)');
  });

  it('should detect deficit duration (-30 min when 20 + 80 + 50 = 150)', () => {
    const result = ScuDurationValidator.validate(20, 80, 50, 180);

    expect(result.isValid).toBeFalse();
    expect(result.status).toBe('DEFICIT');
    expect(result.sum).toBe(150);
    expect(result.difference).toBe(-30);
    expect(result.message).toContain('Déficit: -30 min (Faltan 30 min para 180 min)');
  });

  it('should handle null, undefined, negative, or NaN values by coercing to 0', () => {
    const result = ScuDurationValidator.validate(null, undefined, -15, 180);

    expect(result.isValid).toBeFalse();
    expect(result.status).toBe('DEFICIT');
    expect(result.sum).toBe(0);
    expect(result.difference).toBe(-180);
  });

  it('should support custom target duration', () => {
    const result = ScuDurationValidator.validate(15, 45, 30, 90);

    expect(result.isValid).toBeTrue();
    expect(result.status).toBe('VALIDO');
    expect(result.sum).toBe(90);
    expect(result.target).toBe(90);
  });
});
