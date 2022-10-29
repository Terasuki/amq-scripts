function doGet(e) {
    
    return handleResponse(e);
  }
  
  function doPost(e) {
  
    Logger.log('Received POST request')
    return handleResponse(e);
  }
  
  function createSheets(username) {
    
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(username);
    var templateSheet = spreadsheet.getSheetByName('TEMPLATE');
    var templateStats = spreadsheet.getSheetByName('stTEMPLATE');
  
    if (sheet) {
  
      let sheetSt = spreadsheet.getSheetByName(username + ' - Stats');
      Logger.log('Updating results for ' + username);
      return [sheet, sheetSt];
    }
  
    sheet = spreadsheet.insertSheet(username, {template: templateSheet});
    let sheetSt = spreadsheet.insertSheet(username + ' - Stats', {template: templateStats});
    Logger.log('Created new sheets for ' + username);
  
    return [sheet, sheetSt];
  }
  
  function writeResults(data, sheet) {
  
      let today = new Date();
      let date = (today.getUTCDate() + '/' + (today.getUTCMonth()+1) + '/' + today.getUTCFullYear());  
      let hour = today.getUTCHours();
      let region = (hour < 4) ? 'Western' : (hour > 18) ? 'Central' : 'Eastern';
  
      let row = 1;
  
      for (row = 1; row < 1000; row++) {
  
        if (sheet.getRange(row, 1).isBlank()) {
  
          Logger.log('Found empty row at line ' + row);
          break;
        }
      }
  
      sheet.getRange(row, 2).setValue(region);
      sheet.getRange(row, 1).setValue(date);
      sheet.getRange(row, 3).setValue(data.topPercent);
      sheet.getRange(row, 4).setValue(data.opsRate);
      sheet.getRange(row, 5).setValue(data.edsRate);
      sheet.getRange(row, 6).setValue(data.insRate);
      sheet.getRange(row, 93-data.pointsArray.length, 1, data.pointsArray.length).setValues([data.pointsArray]);
      Logger.log('Successful write');
  }
  
  function createStats(statsSheet, username) {
  
    let rawScores = statsSheet.getRange('C4:D4');
    let rawAverageFormula = ('=TRUNC(AVERAGE({' + username +'!CN2:CN}); 2)');
    let rawBestFormula = ('=MAX({' + username +'!CN2:CN})');
    let rawScoresFormulas = [
      [rawAverageFormula, rawBestFormula]
    ];
  
    rawScores.setFormulas(rawScoresFormulas);
  
    let percentScores = statsSheet.getRange('C6:D6');
    let percentAverageFormula = ('=TRUNC(AVERAGE({' + username +'!C2:C}); 2)');
    let percentBestFormula = ('=MIN({' + username +'!C2:C})');
    let percentScoresFormulas = [
      [percentAverageFormula, percentBestFormula]
    ];
  
    percentScores.setFormulas(percentScoresFormulas);
  
    let songType = statsSheet.getRange('B8:D8');
    let opsFormula = ('=TRUNC(AVERAGE({' + username +'!D2:D}); 2)');
    let edsFormula = ('=TRUNC(AVERAGE({' + username +'!E2:E}); 2)');
    let insFormula = ('=TRUNC(AVERAGE({' + username +'!F2:F}); 2)');
    let songTypeFormulas = [
      [opsFormula, edsFormula, insFormula]
    ];
  
    songType.setFormulas(songTypeFormulas);
  
    Logger.log('Stats updated');
  }
  
  function handleResponse(e) {
  
    var lock = LockService.getDocumentLock();
    lock.waitLock(10000);
  
    try {
  
      let data = JSON.parse(e.parameter.data);
      let allSheets = createSheets(data.name);
      let resultSh = allSheets[0];
      let statsSh = allSheets[1];
  
      writeResults(data, resultSh);
      createStats(statsSh, data.name);
  
      return ContentService
            .createTextOutput(JSON.stringify({'result':'success', 'row': row}))
            .setMimeType(ContentService.MimeType.JSON);
    }
    catch (error) {
  
      return ContentService
            .createTextOutput(JSON.stringify({'result':'error', 'error': error}))
            .setMimeType(ContentService.MimeType.JSON);
    }
    finally {
  
      lock.releaseLock();
    }
  }