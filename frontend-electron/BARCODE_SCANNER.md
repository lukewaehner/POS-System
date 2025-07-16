# Barcode Scanner Integration

## Overview

The POS system now supports barcode scanner integration for the product management interface. This feature allows users to scan product barcodes using USB barcode scanners like the Orbit scanner, which will automatically search for products and add them to the cart.

## How It Works

### Hardware Support

- **USB Barcode Scanners**: The system detects USB barcode scanners that work as HID (Human Interface Device) keyboards
- **Orbit Scanner**: Specifically tested and confirmed to work with Orbit barcode scanners
- **Generic USB Scanners**: Should work with most USB barcode scanners that send keyboard input

### Functionality

1. **Automatic Detection**: The scanner is automatically detected when the app starts
2. **Real-time Scanning**: Scan barcodes anywhere in the Products page
3. **Auto-add to Cart**: Successfully scanned products are automatically added to the cart
4. **Visual Feedback**: Scanner status indicator shows connection and scanning state
5. **Error Handling**: Clear error messages for invalid barcodes or products not found

## Features

### Scanner Status Indicator

Located in the Products page header:

- 🟢 **Green dot**: Scanner connected and ready
- 🟡 **Yellow dot (pulsing)**: Currently scanning
- 🔴 **Red dot**: Scanner disconnected
- **Scan counter**: Shows total number of successful scans

### Automatic Product Lookup

- Scans barcode and searches product database
- Validates stock availability before adding to cart
- Shows success/error notifications
- Handles duplicate additions intelligently

### Quick Add Product Modal

- **New Product Discovery**: When a scanned barcode isn't found in the inventory, automatically opens a "Quick Add Product" modal
- **Pre-filled Barcode**: The modal pre-fills the scanned barcode for convenience
- **Complete Product Form**: Includes fields for name, price, stock quantity, category, and description
- **Immediate Add to Cart**: After creating the product, it's automatically added to the cart
- **Inventory Sync**: New products are immediately available in the product catalog

### Error Handling

- **Product Not Found**: Shows error message with scanned barcode
- **Insufficient Stock**: Prevents adding out-of-stock items
- **Invalid Barcode**: Validates barcode length and format
- **Scanner Errors**: Displays scanner-specific error messages

## Usage

### Basic Usage

1. Connect your USB barcode scanner to the computer
2. Open the POS app and navigate to the Products page
3. Ensure the scanner status shows "Scanner Ready" (green dot)
4. Point the scanner at any product barcode and scan
5. **If the product exists**: It will be automatically added to your cart
6. **If the product doesn't exist**: A "Quick Add Product" modal will appear, allowing you to add the new product to your inventory and cart

### Testing Mode (Development)

When running in development mode, a testing section appears at the bottom of the Products page:

- Manual barcode input field
- "Test Scan" button to simulate scanner input
- Real-time status display showing connection, scan count, and last scanned barcode

### Configuration

The barcode scanner accepts the following configuration options:

- **Minimum barcode length**: 6 characters (default)
- **Maximum barcode length**: 25 characters (default)
- **Scan timeout**: 100ms between keystrokes (default)
- **Error logging**: Enabled in development mode

## Technical Details

### Scanner Detection

- Listens for rapid keyboard input patterns typical of barcode scanners
- Distinguishes between manual typing and scanner input based on timing
- Prevents interference with regular keyboard input in form fields

### Security Features

- Only processes input when not focused on text inputs
- Validates barcode format and length
- Prevents duplicate processing of the same scan
- Automatically resets after successful or failed scans

### Performance

- Minimal performance impact on the application
- Efficient keyboard event handling
- Automatic cleanup of event listeners

## Troubleshooting

### Scanner Not Detected

- **Check USB Connection**: Ensure the scanner is properly connected
- **Driver Installation**: Some scanners may require specific drivers
- **Port Issues**: Try different USB ports
- **Permissions**: On some systems, you may need to grant USB device permissions

### Scanning Issues

- **Barcode Quality**: Ensure barcodes are clear and not damaged
- **Lighting**: Adequate lighting helps with scanning accuracy
- **Distance**: Maintain proper distance between scanner and barcode
- **Angle**: Scan at a perpendicular angle to the barcode

### Products Not Found

- **Barcode Database**: Ensure products are properly added to the database with correct barcodes
- **Barcode Format**: Check that barcode formats match between scanner and database
- **Product Sync**: Refresh the product list if recently added items don't appear

## Development

### Adding Scanner Support to Other Pages

The barcode scanner is implemented as a reusable React hook (`useBarcodeScanner`) that can be easily integrated into other components:

```typescript
import useBarcodeScanner from "../hooks/useBarcodeScanner";

const MyComponent = () => {
  const barcodeScanner = useBarcodeScanner({
    onBarcodeScanned: (barcode) => {
      // Handle scanned barcode
      console.log("Scanned:", barcode);
    },
    onError: (error) => {
      // Handle errors
      console.error("Scanner error:", error);
    },
    enableLogging: true,
  });

  return (
    <div>
      Scanner Status:{" "}
      {barcodeScanner.isConnected ? "Connected" : "Disconnected"}
    </div>
  );
};
```

### Customization

The hook accepts various configuration options for different use cases:

- Barcode length validation
- Scan timeout settings
- Error handling callbacks
- Logging preferences
- Key event prevention

## Future Enhancements

### Planned Features

- **Multiple Scanner Support**: Support for multiple connected scanners
- **Scanner Configuration UI**: Settings panel for scanner preferences
- **Barcode Format Detection**: Automatic detection of different barcode formats
- **Batch Scanning**: Support for scanning multiple items quickly
- **Sound Feedback**: Audio confirmation of successful scans

### Integration Possibilities

- **Inventory Management**: Scan barcodes for stock adjustments
- **Price Checking**: Quick price lookup mode
- **Receipt Scanning**: OCR integration for receipt processing
- **Mobile App**: Extend scanning to mobile devices

## Support

For technical support or feature requests related to barcode scanning:

1. Check the troubleshooting section above
2. Review the scanner manufacturer's documentation
3. Test with the development testing interface
4. Check browser console for error messages

The barcode scanner integration is designed to work seamlessly with the existing POS system while providing the flexibility to expand to other areas of the application.
