import re

with open("src/screens/Wallet/WalletScreen.tsx", "r") as f:
    content = f.read()

start_marker = "{selectedGateway === 'bank' ? ("
end_marker = "        <View style={[styles.withdrawFooter, { marginTop: 24 }]"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    exit(1)

new_content = """{selectedGateway === 'bank' ? (
          <>
            {banks.length > 1 && (
              <View style={{ paddingHorizontal: SPACING.md, marginBottom: 16, zIndex: 10 }}>
                <DropDownPicker
                  open={isBankDropdownOpen}
                  value={selectedBankIndex}
                  items={bankItems}
                  setOpen={setIsBankDropdownOpen}
                  setValue={setSelectedBankIndex}
                  listMode="SCROLLVIEW"
                  style={{ borderColor: '#E2E8F0', borderWidth: 1 }}
                  dropDownContainerStyle={{ borderColor: '#E2E8F0', borderWidth: 1, zIndex: 1000 }}
                  textStyle={{ fontSize: 16, color: '#333' }}
                  placeholder="Chọn ngân hàng"
                  zIndex={1000}
                  zIndexInverse={2000}
                />
              </View>
            )}

            <View style={[styles.qrSection, { backgroundColor: '#fff', marginHorizontal: SPACING.md, borderRadius: 16, marginTop: 8, padding: 16, ...SHADOWS.light }]}>
              <View style={styles.qrPlaceholder}>
                {activeBank?.qrImage && (activeBank.qrImage.startsWith('http') || activeBank.qrImage.startsWith('data:')) ? (
                  <Image source={{ uri: activeBank.qrImage }} style={{ width: 220, height: 220, borderRadius: 12 }} resizeMode="contain" />
                ) : (activeBank?.accountNumber && activeBank?.bankName) ? (
                  <Image
                    source={{ uri: `https://img.vietqr.io/image/${activeBank.bankName.toLowerCase()}-${activeBank.accountNumber}-compact2.png?addInfo=${encodeURIComponent(transferContent)}` }}
                    style={{ width: 220, height: 220, borderRadius: 12 }}
                    resizeMode="contain"
                  />
                ) : (
                  <>
                    <QrCode size={120} color="#000" strokeWidth={1} />
                    <View style={styles.qrCenterLogo}>
                      <Text style={styles.qrLogoText}>v</Text>
                    </View>
                  </>
                )}
              </View>

              <View style={{ width: '100%', marginTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                  <Text style={{ color: '#666', fontSize: 13 }}>Ngân hàng</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>{activeBank?.bankName || 'MB Bank'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                  <Text style={{ color: '#666', fontSize: 13, marginRight: 16 }}>Chủ tài khoản</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333', flexShrink: 1, textAlign: 'right' }}>{activeBank?.accountName || 'VUA XO SO'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                  <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Số tài khoản</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0066FF', marginRight: 8, flexShrink: 1, textAlign: 'right' }}>{activeBank?.accountNumber || '0123456789'}</Text>
                    <TouchableOpacity style={{ padding: 4, backgroundColor: '#e6f0fa', borderRadius: 6 }}>
                      <Copy size={14} color="#0066FF" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Nội dung CK</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E51F27', marginRight: 8, flexShrink: 1, textAlign: 'right' }}>{transferContent}</Text>
                    <TouchableOpacity style={{ padding: 4, backgroundColor: '#ffe6e6', borderRadius: 6 }}>
                      <Copy size={14} color="#E51F27" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ paddingHorizontal: SPACING.md, marginTop: 24 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Số Tiền Nạp</Text>
                <View style={[styles.inputRow, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
                  <TextInput
                    style={styles.amountInput}
                    value={depositAmountStr}
                    onChangeText={handleDepositAmountChange}
                    placeholder="Nhập số tiền nạp"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.currencyText}>VNĐ</Text>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Đính kèm sao kê</Text>
                <TouchableOpacity 
                  style={{ alignSelf: 'center', width: 200, height: 320, justifyContent: 'center', alignItems: 'center', borderColor: '#E2E8F0', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12, backgroundColor: '#F8FAFC', overflow: 'hidden', marginTop: 8 }} 
                  onPress={handlePickReceipt}
                >
                  {receiptImageUri ? (
                    <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  ) : (
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                      <ImageIcon size={40} color={COLORS.gray400} />
                      <Text style={{ color: COLORS.gray500, marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>Nhấn để tải lên ảnh chụp màn hình giao dịch</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : selectedGateway === 'scratch' ? (
          <View style={{ paddingHorizontal: SPACING.md, marginTop: 16, zIndex: 10 }}>
            <View style={{ marginBottom: 16, zIndex: 2000 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Nhà mạng</Text>
              <DropDownPicker
                open={isNetworkDropdownOpen}
                value={scratchNetwork}
                items={[
                  { label: 'Viettel', value: 'Viettel' },
                  { label: 'Vinaphone', value: 'Vinaphone' },
                  { label: 'Mobifone', value: 'Mobifone' },
                  { label: 'Vietnamobile', value: 'Vietnamobile' },
                ]}
                setOpen={setIsNetworkDropdownOpen}
                setValue={setScratchNetwork}
                listMode="SCROLLVIEW"
                style={{ borderColor: '#E2E8F0', borderWidth: 1 }}
                dropDownContainerStyle={{ borderColor: '#E2E8F0', borderWidth: 1, zIndex: 2000 }}
                textStyle={{ fontSize: 16, color: '#333' }}
                zIndex={2000}
                zIndexInverse={1000}
              />
            </View>
            <View style={{ marginBottom: 16, zIndex: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Số Seri</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
                <TextInput
                  style={styles.amountInput}
                  value={scratchSeri}
                  onChangeText={setScratchSeri}
                  placeholder="Nhập số Seri"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>
            <View style={{ marginBottom: 16, zIndex: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Mã thẻ (PIN)</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
                <TextInput
                  style={styles.amountInput}
                  value={scratchPin}
                  onChangeText={setScratchPin}
                  placeholder="Nhập mã thẻ PIN"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>
            
            <View style={{ marginBottom: 16, zIndex: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Ảnh thẻ cào</Text>
              <TouchableOpacity style={{ alignSelf: 'center', width: 200, height: 320, justifyContent: 'center', alignItems: 'center', borderColor: '#E2E8F0', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12, backgroundColor: '#F8FAFC', overflow: 'hidden', marginTop: 8 }} onPress={handlePickReceipt}>
                {receiptImageUri ? (
                  <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : (
                  <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                    <ImageIcon size={40} color={COLORS.gray400} />
                    <Text style={{ color: COLORS.gray500, marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>Nhấn để tải lên ảnh thẻ cào</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : ['momo', 'zalopay', 'vnpay', 'ninepay', 'shopeepay', 'tiktokpay', 'lazadapay', 'paypal'].includes(selectedGateway) ? (
          (() => {
            const wallet = depositConfig?.walletsConfig?.[selectedGateway];
            return (
              <>
                <View style={[styles.qrSection, { backgroundColor: '#fff', marginHorizontal: SPACING.md, borderRadius: 16, marginTop: 8, padding: 16, ...SHADOWS.light }]}>
                  <View style={styles.qrPlaceholder}>
                    {wallet?.qrImage && (wallet.qrImage.startsWith('http') || wallet.qrImage.startsWith('data:')) ? (
                      <Image source={{ uri: wallet.qrImage }} style={{ width: 220, height: 220, borderRadius: 12 }} resizeMode="contain" />
                    ) : (
                      <>
                        <QrCode size={120} color="#000" strokeWidth={1} />
                        <View style={styles.qrCenterLogo}>
                          <Text style={styles.qrLogoText}>QR</Text>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={{ width: '100%', marginTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ color: '#666', fontSize: 13 }}>Loại ví</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>{selectedGateway.toUpperCase()}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ color: '#666', fontSize: 13, marginRight: 16 }}>Chủ tài khoản</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333', flexShrink: 1, textAlign: 'right' }}>{wallet?.accountName || 'VUA XO SO'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Số tài khoản</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0066FF', marginRight: 8, flexShrink: 1, textAlign: 'right' }}>{wallet?.accountNumber || '0123456789'}</Text>
                        <TouchableOpacity style={{ padding: 4, backgroundColor: '#e6f0fa', borderRadius: 6 }}>
                          <Copy size={14} color="#0066FF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Nội dung CK</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E51F27', marginRight: 8, flexShrink: 1, textAlign: 'right' }}>{transferContent}</Text>
                        <TouchableOpacity style={{ padding: 4, backgroundColor: '#ffe6e6', borderRadius: 6 }}>
                          <Copy size={14} color="#E51F27" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={{ paddingHorizontal: SPACING.md, marginTop: 24 }}>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Số Tiền Nạp</Text>
                    <View style={[styles.inputRow, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
                      <TextInput
                        style={styles.amountInput}
                        value={depositAmountStr}
                        onChangeText={handleDepositAmountChange}
                        placeholder="Nhập số tiền nạp"
                        placeholderTextColor={COLORS.gray400}
                        keyboardType="number-pad"
                      />
                      <Text style={styles.currencyText}>VNĐ</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Đính kèm sao kê</Text>
                    <TouchableOpacity style={{ alignSelf: 'center', width: 200, height: 320, justifyContent: 'center', alignItems: 'center', borderColor: '#E2E8F0', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12, backgroundColor: '#F8FAFC', overflow: 'hidden', marginTop: 8 }} onPress={handlePickReceipt}>
                      {receiptImageUri ? (
                        <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                      ) : (
                        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                          <ImageIcon size={40} color={COLORS.gray400} />
                          <Text style={{ color: COLORS.gray500, marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>Nhấn để tải lên ảnh chụp màn hình giao dịch</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            );
          })()
        ) : (
          <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#f0f5fa', borderRadius: 8, marginHorizontal: SPACING.md }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 16 }}>Tính năng đang được phát triển</Text>
            <Text style={{ color: COLORS.gray600, textAlign: 'center', marginTop: 8 }}>
              Cổng thanh toán này hiện đang trong quá trình bảo trì hoặc nâng cấp. Vui lòng chọn phương thức khác!
            </Text>
          </View>
        )}
"""

with open("src/screens/Wallet/WalletScreen.tsx", "w") as f:
    f.write(content[:start_idx] + new_content + "\n" + content[end_idx:])

print("Successfully updated WalletScreen.tsx!")

