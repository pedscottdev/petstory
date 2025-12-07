## Task 1: Cập nhật quy tắc hiển thị các thẻ thú cưng
- Nếu người dùng truy cập vào trang cá nhân của bản thân, thẻ thú cưng của sẽ hiển thị nút "Xem" và "Chỉnh sửa"
- Nếu người dùng truy cập vào trang cá nhân của người khác, thẻ thú cưng của sẽ hiển thị nút "Xem" và "Thích/hủy thích"

## Task 2: Chức năng xem thông tin thú cưng
- Khi người dùng bấm "Xem" thông tin thú cưng, sẽ hiển thị dialog chứa thông tin chi tiết về thú cưng, dialog thông tin sẽ hiển thị theo layout sau:
    <Card key={pet._id} className="rounded-3xl shadow-none border border-gray-300 pt-3 overflow-hidden gap-y-4">
      <CardHeader className="px-3">
        <div className="relative bg-gradient-to-b from-[#f2eef0] via-[#fffbfd] to-white rounded-xl h-32 pt-12 flex items-center justify-center">
          <Avatar className="w-28 h-28   ">
            <AvatarImage src={pet.avatar_url} alt={pet.name} className={"object-cover"}/>
            <AvatarFallback className="text-2xl bg-black text-white">
              {pet.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute top-0 right-3 mt-3 text-sm font-semibold px-2 py-0.5 bg-[#f0d8e4] rounded-lg text-[#bb065a] flex items-center">
            {/* <Heart className="h-4 w-4 mr-1 text-red-500" /> */
            }
            <span>{pet.likeCount} lượt thích</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pb-0 px-6 pt-0">
        <CardTitle className="flex justify-between items-center">
          <span className='page-header text-[27px] text-[#6c0937]'>{pet.name}</span>
          <span className="text-sm font-medium bg-[#f2ebe5] px-3 py-1 rounded-full">
            {pet.species == "dog" ? "Chó" : pet.species == "cat" ? "Mèo" : "Chim"}
          </span>
        </CardTitle>
        <p className="mt-3 h-10 text-sm text-gray-600 line-clamp-2">
          {pet.description || "Thú cưng này chưa có mô tả"}
        </p>

        {/* Pet information grid similar to user stats in followings page */}
        <div className="bg-gray-100 py-3 rounded-lg flex items-center justify-between gap-2 text-center text-sm mt-3 px-6">
          <div className='w-fit text-nowrap'>
            <div className="font-bold text-[16px]">{pet.breed || 'Chưa xác định'}</div>
            <div className="text-muted-foreground text-xs">Giống</div>
          </div>
          <div>
            <div className="font-bold text-[16px]">{pet.age} tháng</div>
            <div className="text-muted-foreground text-xs">Tuổi</div>
          </div>
          <div>
            <div className="font-bold text-[16px] capitalize">{pet.gender === 'male' ? 'Đực' : 'Cái'}</div>
            <div className="text-muted-foreground text-xs">Giới tính</div>
          </div>
        </div>
      </CardContent>
    </Card>
- Người dùng chỉ có quyền xem, không thể chỉnh sửa thông tin

## Task 3: Chức năng "Chỉnh sửa thông tin thú cưng"
- Khi người dùng bấm "Chỉnh sửa thông tin thú cưng", sẽ hiển thị dialog hiển thị thông tin thú cưng
- Dialog chỉnh sửa thông tin thú cưng có dạng:
          <DialogContent className="min-w-xl">
            {editingPet && (
              <>
                <DialogHeader>
                  <DialogTitle className={'page-header text-[22px]'}>Chỉnh sửa thông tin thú cưng</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Avatar Upload Section */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-avatar" className="text-right">
                      Ảnh đại diện
                    </Label>
                    <div className="col-span-3">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={editingPetAvatarPreview || editingPet.avatar_url} alt="Pet preview" />
                          <AvatarFallback className="bg-[#E6DDD5]">
                            {editingPet.name ? editingPet.name.charAt(0) : 'Pet'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" onClick={triggerEditingPetAvatarInput}>
                            Chọn ảnh
                          </Button>
                          {(editingPetAvatarPreview || editingPet.avatar_url) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={removeEditingPetAvatar}
                              className="flex items-center gap-1"
                            >
                              <X className="h-4 w-4" />
                              Xóa
                            </Button>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            ref={editingPetAvatarInputRef}
                            className="hidden"
                            onChange={handleEditingPetAvatarUpload}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Định dạng JPG, PNG. Kích thước tối đa 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-name" className="text-right">
                      Tên
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingPet.name}
                      onChange={(e) => setEditingPet({ ...editingPet, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Tên thú cưng"
                    />
                  </div>
                  <div className="w-full grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-species" className="text-right col-span-1">
                      Loài
                    </Label>
                    <Select
                      value={editingPet.species}
                      onValueChange={(value) => setEditingPet({ ...editingPet, species: value })}
                      className=""
                    >
                      <SelectTrigger className="!col-span-3 !w-full">
                        <SelectValue placeholder="Chọn loài" />
                      </SelectTrigger>
                      <SelectContent>
                        {speciesOptions.map((species) => (
                          <SelectItem key={species.value} value={species.value}>
                            {species.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-breed" className="text-right">
                      Giống
                    </Label>
                    <Input
                      id="edit-breed"
                      value={editingPet.breed}
                      onChange={(e) => setEditingPet({ ...editingPet, breed: e.target.value })}
                      className="col-span-3"
                      placeholder="Giống của thú cưng"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-gender" className="text-right">
                      Giới tính
                    </Label>
                    <div className="col-span-3 flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="edit-gender"
                          value="male"
                          checked={editingPet.gender === 'male'}
                          onChange={(e) => setEditingPet({ ...editingPet, gender: e.target.value })}
                          className="mr-2"
                        />
                        Đực
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="edit-gender"
                          value="female"
                          checked={editingPet.gender === 'female'}
                          onChange={(e) => setEditingPet({ ...editingPet, gender: e.target.value })}
                          className="mr-2"
                        />
                        Cái
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-age" className="text-right">
                      Tuổi
                    </Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editingPet.age}
                      onChange={(e) => setEditingPet({ ...editingPet, age: e.target.value })}
                      className="col-span-3"
                      placeholder="Tuổi"
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-description" className="text-right">
                      Mô tả
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editingPet.description}
                      onChange={(e) => setEditingPet({ ...editingPet, description: e.target.value })}
                      className="col-span-3"
                      placeholder="Mô tả về thú cưng"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    onClick={handleUpdatePet}
                    className="bg-[#91114D] hover:bg-[#91114D]/90"
                    disabled={isSubmitting || imageUploading}
                  >
                    {isSubmitting || imageUploading ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>

                </div>
              </>
            )}
          </DialogContent>
- Khi người dùng đã chỉnh sửa thông tin và bấm "Hủy", sẽ hiển thị alert dialog xác nhận "Bạn có chắc muốn hủy chỉnh sửa?"
- Hệ thống hiển thị thông báo khi chỉnh sửa thành công hoặc thất bại
