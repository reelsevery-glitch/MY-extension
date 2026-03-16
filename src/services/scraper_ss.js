const fetch = require('node-fetch');

async function scrape_ss(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ka,en;q=0.5',
      }
    });

    const html = await response.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) return null;

    const nextData = JSON.parse(match[1]);
    const listing = nextData?.props?.pageProps?.applicationData;
    if (!listing) return null;

    // სურათები — fileName სრული URL
    const images = listing.appImages || [];
    const files = images
      .sort((a, b) => a.orderNo - b.orderNo)
      .map(img => img.fileName)
      .filter(Boolean);

    const address = listing.address || {};
    const desc = listing.description || {};
    const price = listing.price || {};

    // ყველა რიცხვი parseInt/parseFloat - SS API-ს number სჭირდება
    const template = {
      realEstateDealTypeId: listing.realEstateDealTypeId,
      realEstateTypeId: listing.realEstateTypeId,
      cityId: address.cityId,
      districtId: address.districtId || null,
      subdistrictId: address.subdistrictId || null,
      streetId: address.streetId,
      streetNumber: address.streetNumber || '',
      // ფართობი — string-იდან number-ად
      totalArea: listing.totalArea ? parseFloat(listing.totalArea) : null,
      areaOfHouse: listing.areaOfHouse ? parseFloat(listing.areaOfHouse) : null,
      kitchenArea: listing.kitchenArea ? parseFloat(listing.kitchenArea) : null,
      // სართული — string-იდან number-ად
      floor: listing.floor ? parseInt(listing.floor) : null,
      totalFloors: listing.floors ? parseInt(listing.floors) : null,
      // ოთახები
      rooms: listing.rooms ? parseInt(listing.rooms) : null,
      bedrooms: listing.bedrooms ? parseInt(listing.bedrooms) : null,
      toilet: listing.toilet ? parseInt(listing.toilet) : null,
      balcony_Loggia: listing.balcony_Loggia ? parseInt(listing.balcony_Loggia) : null,
      // ფასი
      priceUsd: price.priceUsd || null,
      priceGeo: price.priceGeo || null,
      currencyType: price.currencyType || 2,
      // აღწერა
      descriptionGe: desc.ka || desc.text || '',
      descriptionEn: desc.en || '',
      descriptionRu: desc.ru || '',
      // სტატუსი და მდგომარეობა
      realEstateStatusId: listing.realEstateStatusId || null,
      state: listing.state || null,
      project: listing.project || null,
      floorType: listing.floorType || 0,
      commercialType: listing.commercialType || 0,
      // კეთილმოწყობა (boolean)
      balcony: listing.balcony || false,
      elevator: listing.elevator || false,
      furniture: listing.furniture || false,
      airConditioning: listing.airConditioning || false,
      internet: listing.internet || false,
      heating: listing.heating || false,
      hotWater: listing.hotWater || false,
      naturalGas: listing.naturalGas || false,
      garage: listing.garage || false,
      storage: listing.storage || false,
      tv: listing.tv || false,
      fridge: listing.fridge || false,
      washingMachine: listing.washingMachine || false,
      cableTelevision: listing.cableTelevision || false,
      telephone: listing.telephone || false,
      securityAlarm: listing.securityAlarm || false,
      ironDoor: listing.ironDoor || false,
      glazedWindows: listing.glazedWindows || false,
      withPool: listing.withPool || false,
      isPetFriendly: listing.isPetFriendly || false,
      comfortable: listing.comfortable || false,
      light: listing.light || false,
      viewOnYard: listing.viewOnYard || false,
      viewOnStreet: listing.viewOnStreet || false,
      // კოორდინატები
      locationLatitude: listing.locationLatitude || null,
      locationLongitude: listing.locationLongitude || null,
      isManualPin: listing.isManualPin || false,
      // ტელეფონი
      phoneNumbers: [{ phoneNumber: '' }],
    };

    const title = listing.title || desc.ka?.substring(0, 60) || 'განცხადება';
    return { template, files, title };
  } catch (e) {
    console.error('SS Scrape error:', e.message);
    return null;
  }
}

module.exports = { scrape_ss };
