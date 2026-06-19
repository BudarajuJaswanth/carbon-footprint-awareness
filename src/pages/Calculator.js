import { createElement } from '../utils/dom.js';
import { store } from '../services/Store.js';
import { InputValidator } from '../validators/InputValidator.js';
import { CalculatorService } from '../services/CalculatorService.js';
import { createFootprintModel } from '../models/Schema.js';
import { Card } from '../components/Card.js';

/**
 * Renders the multi-step Carbon Calculator.
 * @returns {HTMLElement} Calculator page DOM element
 */
export function renderCalculator() {
  const container = createElement('div', { className: 'calculator-container' });

  // Page Header
  container.appendChild(
    createElement('div', { className: 'dashboard-header' },
      createElement('h1', { className: 'dashboard-title', textContent: 'Carbon Footprint Calculator' }),
      createElement('p', { className: 'dashboard-subtitle', textContent: 'Input your activities to estimate your monthly CO₂e emissions.' })
    )
  );

  // Form State
  let currentStep = 1;
  const formData = {
    transportation: {
      carDistance: '',
      fuelType: 'PETROL',
      publicDistance: '',
      flightsShort: '',
      flightsLong: ''
    },
    energy: {
      electricity: '',
      renewable: ''
    },
    lifestyle: {
      diet: 'AVERAGE',
      shopping: 'AVERAGE',
      waste: 'AVERAGE'
    }
  };

  // Error State tracker
  const fieldErrors = {};

  // Form structure element
  const formElement = createElement('form', { 
    id: 'calculator-form', 
    novalidate: 'true',
    onSubmit: (e) => e.preventDefault() 
  });

  // Step Indicators
  const stepIndicatorsContainer = createElement('div', { className: 'calc-nav-steps' });
  const stepsMeta = [
    { num: 1, label: 'Transportation' },
    { num: 2, label: 'Energy' },
    { num: 3, label: 'Lifestyle' }
  ];

  const indicatorNodes = stepsMeta.map(step => {
    return createElement('div', {
      id: `step-indicator-${step.num}`,
      className: `calc-step-indicator ${step.num === 1 ? 'active' : ''}`,
      textContent: String(step.num),
      title: step.label,
      'aria-label': `Step ${step.num}: ${step.label}`
    });
  });
  indicatorNodes.forEach(node => stepIndicatorsContainer.appendChild(node));
  container.appendChild(stepIndicatorsContainer);

  // Helper to update visual step indicator states
  const updateStepIndicators = () => {
    indicatorNodes.forEach((node, idx) => {
      const stepNum = idx + 1;
      node.className = 'calc-step-indicator';
      if (stepNum === currentStep) {
        node.classList.add('active');
      } else if (stepNum < currentStep) {
        node.classList.add('completed');
        // Render completed checkmark inside circle
        node.textContent = '✓';
      } else {
        node.textContent = String(stepNum);
      }
    });
  };

  // Helper to show/hide validation errors in DOM
  const displayFieldError = (fieldId, errorMessage) => {
    const errorSpan = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorSpan) {
      if (errorMessage) {
        errorSpan.textContent = errorMessage;
        errorSpan.style.display = 'block';
        if (inputElement) {
          inputElement.setAttribute('aria-invalid', 'true');
          inputElement.style.borderColor = 'var(--danger)';
        }
      } else {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
        if (inputElement) {
          inputElement.removeAttribute('aria-invalid');
          inputElement.style.borderColor = '';
        }
      }
    }
  };

  // --- Step 1: Transportation Form Fields ---
  const step1Section = createElement('div', { className: 'calculator-section active', id: 'step-section-1' },
    Card({ title: '1. Transportation Profile' },
      // Car travel
      createElement('div', { className: 'grid-2' },
        createElement('div', { className: 'form-group' },
          createElement('label', { className: 'form-label', htmlFor: 'carDistance', textContent: 'Monthly Car Driving (km)' }),
          createElement('input', {
            type: 'number',
            id: 'carDistance',
            className: 'form-input',
            placeholder: 'e.g. 500',
            min: '0',
            value: formData.transportation.carDistance,
            'aria-describedby': 'carDistance-error',
            onInput: (e) => {
              formData.transportation.carDistance = e.target.value;
              delete fieldErrors.carDistance;
              displayFieldError('carDistance', null);
            }
          }),
          createElement('span', { className: 'form-error', id: 'carDistance-error', style: { display: 'none' } })
        ),
        createElement('div', { className: 'form-group' },
          createElement('label', { className: 'form-label', htmlFor: 'fuelType', textContent: 'Car Fuel Type' }),
          createElement('select', {
            id: 'fuelType',
            className: 'form-select',
            onInput: (e) => {
              formData.transportation.fuelType = e.target.value;
            }
          },
            createElement('option', { value: 'PETROL', textContent: 'Petrol / Gas' }),
            createElement('option', { value: 'DIESEL', textContent: 'Diesel' }),
            createElement('option', { value: 'HYBRID', textContent: 'Hybrid' }),
            createElement('option', { value: 'ELECTRIC', textContent: 'Electric Vehicle (EV)' })
          )
        })
      ),
      // Public Transit
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'publicDistance', textContent: 'Monthly Public Transport (Bus, Train in km)' }),
        createElement('input', {
          type: 'number',
          id: 'publicDistance',
          className: 'form-input',
          placeholder: 'e.g. 150',
          min: '0',
          value: formData.transportation.publicDistance,
          'aria-describedby': 'publicDistance-error',
          onInput: (e) => {
            formData.transportation.publicDistance = e.target.value;
            delete fieldErrors.publicDistance;
            displayFieldError('publicDistance', null);
          }
        }),
        createElement('span', { className: 'form-error', id: 'publicDistance-error', style: { display: 'none' } })
      ),
      // Flights
      createElement('div', { className: 'grid-2' },
        createElement('div', { className: 'form-group' },
          createElement('label', { className: 'form-label', htmlFor: 'flightsShort', textContent: 'Short Flights per Year (< 3 hours)' }),
          createElement('input', {
            type: 'number',
            id: 'flightsShort',
            className: 'form-input',
            placeholder: 'e.g. 2',
            min: '0',
            value: formData.transportation.flightsShort,
            'aria-describedby': 'flightsShort-error',
            onInput: (e) => {
              formData.transportation.flightsShort = e.target.value;
              delete fieldErrors.flightsShort;
              displayFieldError('flightsShort', null);
            }
          }),
          createElement('span', { className: 'form-error', id: 'flightsShort-error', style: { display: 'none' } })
        ),
        createElement('div', { className: 'form-group' },
          createElement('label', { className: 'form-label', htmlFor: 'flightsLong', textContent: 'Long Flights per Year (>= 3 hours)' }),
          createElement('input', {
            type: 'number',
            id: 'flightsLong',
            className: 'form-input',
            placeholder: 'e.g. 1',
            min: '0',
            value: formData.transportation.flightsLong,
            'aria-describedby': 'flightsLong-error',
            onInput: (e) => {
              formData.transportation.flightsLong = e.target.value;
              delete fieldErrors.flightsLong;
              displayFieldError('flightsLong', null);
            }
          }),
          createElement('span', { className: 'form-error', id: 'flightsLong-error', style: { display: 'none' } })
        )
      )
    )
  );

  // --- Step 2: Energy Form Fields ---
  const step2Section = createElement('div', { className: 'calculator-section', id: 'step-section-2' },
    Card({ title: '2. Home Energy Consumption' },
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'electricity', textContent: 'Monthly Electricity Usage (kWh)' }),
        createElement('input', {
          type: 'number',
          id: 'electricity',
          className: 'form-input',
          placeholder: 'e.g. 350',
          min: '0',
          value: formData.energy.electricity,
          'aria-describedby': 'electricity-error',
          onInput: (e) => {
            formData.energy.electricity = e.target.value;
            delete fieldErrors.electricity;
            displayFieldError('electricity', null);
          }
        }),
        createElement('span', { className: 'form-error', id: 'electricity-error', style: { display: 'none' } })
      ),
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'renewable', textContent: 'Renewable Electricity Percentage (%)' }),
        createElement('input', {
          type: 'number',
          id: 'renewable',
          className: 'form-input',
          placeholder: 'e.g. 0 to 100',
          min: '0',
          max: '100',
          value: formData.energy.renewable,
          'aria-describedby': 'renewable-error',
          onInput: (e) => {
            formData.energy.renewable = e.target.value;
            delete fieldErrors.renewable;
            displayFieldError('renewable', null);
          }
        }),
        createElement('span', { className: 'form-error', id: 'renewable-error', style: { display: 'none' } })
      )
    )
  );

  // --- Step 3: Lifestyle Form Fields ---
  const step3Section = createElement('div', { className: 'calculator-section', id: 'step-section-3' },
    Card({ title: '3. Lifestyle Choices' },
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'diet', textContent: 'Primary Diet Type' }),
        createElement('select', {
          id: 'diet',
          className: 'form-select',
          onInput: (e) => {
            formData.lifestyle.diet = e.target.value;
          }
        },
          createElement('option', { value: 'AVERAGE', textContent: 'Average Meat Consumption' }),
          createElement('option', { value: 'HIGH_MEAT', textContent: 'High Meat Consumption' }),
          createElement('option', { value: 'LOW_MEAT', textContent: 'Low Meat (Flexitarian)' }),
          createElement('option', { value: 'VEGETARIAN', textContent: 'Vegetarian' }),
          createElement('option', { value: 'VEGAN', textContent: 'Vegan' })
        )
      ),
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'shopping', textContent: 'Shopping & Consumer Habits' }),
        createElement('select', {
          id: 'shopping',
          className: 'form-select',
          onInput: (e) => {
            formData.lifestyle.shopping = e.target.value;
          }
        },
          createElement('option', { value: 'AVERAGE', textContent: 'Average shopping (buy new items frequently)' }),
          createElement('option', { value: 'MINIMALIST', textContent: 'Minimalist (eco-conscious, shop secondhand)' }),
          createElement('option', { value: 'HEAVY', textContent: 'Heavy shopper (frequent new clothing, gadgets)' })
        )
      ),
      createElement('div', { className: 'form-group' },
        createElement('label', { className: 'form-label', htmlFor: 'waste', textContent: 'Household Waste Generation' }),
        createElement('select', {
          id: 'waste',
          className: 'form-select',
          onInput: (e) => {
            formData.lifestyle.waste = e.target.value;
          }
        },
          createElement('option', { value: 'AVERAGE', textContent: 'Average waste bins' }),
          createElement('option', { value: 'LOW', textContent: 'Low waste (strict recycling/composting)' }),
          createElement('option', { value: 'HIGH', textContent: 'High waste (no recycling, high discard)' })
        )
      )
    )
  );

  // Append sections to form
  formElement.appendChild(step1Section);
  formElement.appendChild(step2Section);
  formElement.appendChild(step3Section);

  // Navigation Buttons Container
  const btnBack = createElement('button', {
    type: 'button',
    className: 'btn btn-secondary',
    style: { visibility: 'hidden' }, // hidden on step 1
    textContent: 'Back',
    onClick: () => handleStepNavigation(-1)
  });

  const btnNext = createElement('button', {
    type: 'button',
    className: 'btn btn-primary',
    textContent: 'Next Step',
    onClick: () => handleStepNavigation(1)
  });

  const controlsWrapper = createElement('div', {
    style: { display: 'flex', justifyContent: 'space-between', marginTop: '24px' }
  }, btnBack, btnNext);

  formElement.appendChild(controlsWrapper);
  container.appendChild(formElement);

  // Form Navigation Logic
  const handleStepNavigation = (direction) => {
    // 1. If going forward, validate current step fields
    if (direction === 1) {
      let stepIsValid = true;

      if (currentStep === 1) {
        const res = InputValidator.validateTransportation(formData.transportation);
        stepIsValid = res.isValid;
        Object.assign(fieldErrors, res.errors);
        
        // Render step 1 errors
        ['carDistance', 'publicDistance', 'flightsShort', 'flightsLong'].forEach(field => {
          displayFieldError(field, res.errors[field]);
        });
      } else if (currentStep === 2) {
        const res = InputValidator.validateEnergy(formData.energy);
        stepIsValid = res.isValid;
        Object.assign(fieldErrors, res.errors);

        // Render step 2 errors
        ['electricity', 'renewable'].forEach(field => {
          displayFieldError(field, res.errors[field]);
        });
      }

      if (!stepIsValid) {
        // Find first invalid input and focus it for accessibility
        const invalidInput = formElement.querySelector('[aria-invalid="true"]');
        if (invalidInput) {
          invalidInput.focus();
        }
        return; // Halt navigation
      }
    }

    // 2. Adjust step index
    currentStep += direction;

    // 3. Handle submit triggers on step 3 transition
    if (currentStep > 3) {
      submitFootprint();
      return;
    }

    // 4. Update section visibilities
    document.getElementById('step-section-1').style.display = currentStep === 1 ? 'block' : 'none';
    document.getElementById('step-section-2').style.display = currentStep === 2 ? 'block' : 'none';
    document.getElementById('step-section-3').style.display = currentStep === 3 ? 'block' : 'none';

    // 5. Update buttons labels & visibility
    btnBack.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    btnNext.textContent = currentStep === 3 ? 'Submit Calculation' : 'Next Step';

    // 6. Update step progress header
    updateStepIndicators();
  };

  // Submit Calculations & Trigger Store Save
  const submitFootprint = () => {
    // Final check validation of lifestyle
    const lifestyleRes = InputValidator.validateLifestyle(formData.lifestyle);
    if (!lifestyleRes.isValid) {
      currentStep = 3;
      updateStepIndicators();
      // display errors
      return;
    }

    // Process inputs, substitute defaults for empty values
    const sanitizedInputs = {
      transportation: {
        carDistance: Number(formData.transportation.carDistance || 0),
        fuelType: formData.transportation.fuelType,
        publicDistance: Number(formData.transportation.publicDistance || 0),
        flightsShort: Number(formData.transportation.flightsShort || 0),
        flightsLong: Number(formData.transportation.flightsLong || 0)
      },
      energy: {
        electricity: Number(formData.energy.electricity || 0),
        renewable: Number(formData.energy.renewable || 0)
      },
      lifestyle: {
        diet: formData.lifestyle.diet,
        shopping: formData.lifestyle.shopping,
        waste: formData.lifestyle.waste
      }
    };

    // Calculate emissions
    const emissions = CalculatorService.calculateFootprint(sanitizedInputs);

    // Create entry model
    const footprintEntry = createFootprintModel({
      ...sanitizedInputs,
      emissions
    });

    // Save footprint
    store.addFootprint(footprintEntry);

    // Redirect to dashboard
    window.location.hash = '#/dashboard';
  };

  return container;
}
