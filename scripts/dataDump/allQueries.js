print('Starting...');

print("Checkpoint 0");
db.caMailAnalytics.remove();

print("Checkpoint 1");
db.mails.find({userId:{$in:[ObjectId("515e03478acbf94e10000018"),ObjectId("514270286a9290970a000009"),ObjectId("5161d64164c184964c000005"),ObjectId("51946cb957c6804a08000ebb"),ObjectId("51aad1716af1a8cc7d0013a2"),ObjectId("51ef2700e628d52c4500b096"),ObjectId("52014cb085b1d0cc7a00fc1c"),ObjectId("5203c451b4562b567d008490"),ObjectId("52094bac12fae4601c00da6f"),ObjectId("520a66febd264e4936004920"),ObjectId("52322f1b343a0a291a0050d2"),ObjectId("527dc121da249abd220148fb"),ObjectId("515ca3b8abc4000e2a000014"),ObjectId("51d6d1f2e992bcdf6100b4bc"),ObjectId("51d8aa5b4ef29d2a6b000230"),ObjectId("51f34186601ba3480f018cae"),ObjectId("5201b46c5c03a6d64a00365d"),ObjectId("520417fdb4562b567d013ba4"),ObjectId("520a7853799578012b000016"),ObjectId("520d27e00ba5e70a41012223"),ObjectId("5277e26c436a7c0c0700ecce"),ObjectId("51d3d61fe992bcdf61002046"),ObjectId("51ea40e78856d1803100832c"),ObjectId("51f1ca40601ba3480f007dae"),ObjectId("5203c3bcb4562b567d00815c"),ObjectId("5207239067dd00762401bb5d"),ObjectId("520a62d49f7c3116110096d6"),ObjectId("5268c98e876cb1557b017ba3"),ObjectId("51db40d9f6916bbd6f008c90"),ObjectId("51e9d2958856d18031006f16"),ObjectId("51ea41688856d1803100832e"),ObjectId("52048087f666a40a17003f19"),ObjectId("5213dce78ac3974c2900d03e"),ObjectId("522787426859f8b305000186"),ObjectId("519e4904360be9fa7d01bebf"),ObjectId("51dce172f6916bbd6f017e83"),ObjectId("51e99d04e029512e160024d1"),ObjectId("51eb0612e029512e16005fbc"),ObjectId("51f1c598601ba3480f0079eb"),ObjectId("5201325d85b1d0cc7a00d830"),ObjectId("520186d985b1d0cc7a018157"),ObjectId("522fcbfba3304a4d1e00dcdf"),ObjectId("516a1127676a40d77400000c"),ObjectId("51d3d614cfa6bd8d460010a1"),ObjectId("51dee86197885c955c0082a3"),ObjectId("51eb0003e029512e16005fb7"),ObjectId("51ec49b5e029512e16008ece"),ObjectId("51f2a793601ba3480f00f6e0"),ObjectId("521e4c68ee98eb7c43000e78"),ObjectId("51685f0e676a40d774000008"),ObjectId("517600da676a40d774000014"),ObjectId("51c10904eaf4d420360332bb"),ObjectId("52013cfebf54e991270100b7"),ObjectId("5201557fbf54e991270129f5"),ObjectId("52015c5085b1d0cc7a01405f"),ObjectId("52024f439d3d2f265a0020d8"),ObjectId("52026793122bae8d31004453"),ObjectId("52067752b6a5f62918004c2c"),ObjectId("5217f46c6c67797f3300dd44"),ObjectId("521eda2f21921e606100eab6"),ObjectId("51631e65d8b6827a4f000007"),ObjectId("51f16dbc52893ef96a000960"),ObjectId("52014bd4bf54e991270114c5"),ObjectId("5209aea79389d5ac06003701"),ObjectId("5209be9d9389d5ac060048fe"),ObjectId("5286bd624c6928003300be61"),ObjectId("51a790fc352a16440d003dd7"),ObjectId("51d47a82cfa6bd8d46003db2"),ObjectId("51d9f05ef6916bbd6f000767"),ObjectId("51e95e67e029512e160001c9"),ObjectId("51edac19d9ba27f5100096c1"),ObjectId("5201b6945c03a6d64a00395d"),ObjectId("52018210bf54e99127017255"),ObjectId("5205fde367dd0076240176e9"),ObjectId("52255f4c212b1c337a00eefc"),ObjectId("5232c84cd1d70ba96f00a81b"),ObjectId("52362457325e6a845b00a402"),ObjectId("5258986b100c5db71b001c12"),ObjectId("515a55aa0c0bee4a7b000005"),ObjectId("51b235a53317b17e30015243"),ObjectId("51c8e009986bebf622001158"),ObjectId("51db08f8a5bd14720c006bbd"),ObjectId("51f034b0ca780e922d0106e8"),ObjectId("52018c3616ea3e2c220005a1"),ObjectId("52044281f666a40a17000df4"),ObjectId("520558b0e3629b187b00e89c"),ObjectId("52090c8ae59523611a0018a2"),ObjectId("5282971ea46deb2b09006fa1"),ObjectId("519644e591b1e96928010c2d"),ObjectId("51e006ad6ea79a7c28000959"),ObjectId("51eae5a7e029512e16005eb3"),ObjectId("51eeede5e628d52c4500450b"),ObjectId("5201fded5c03a6d64a00b4f3"),ObjectId("5205f59fb6a5f629180013bf"),ObjectId("5227d0c474377b17730086fd"),ObjectId("5236b43944c0ed09070047f3"),ObjectId("5238ee106d465412170129de"),ObjectId("52867bd241b3b7ae3800ec05"),ObjectId("5291f921b40014c04001456a"),ObjectId("515dc15e6dc3e3370c000008")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 2");
db.mails.find({userId:{$in:[ObjectId("5192eed46aebff325900fb20"),ObjectId("51df2ec2e0633c017800a339"),ObjectId("51e452486ea79a7c2800df65"),ObjectId("51ea11598856d1803100789b"),ObjectId("5202f35e122bae8d31014015"),ObjectId("5204dbd667dd007624001319"),ObjectId("521a6dc128c2b95432005173"),ObjectId("51673e65676a40d774000005"),ObjectId("51cde20f8a340c8f14003e30"),ObjectId("51e9c2428856d180310062de"),ObjectId("52013b3fbf54e9912700fd0f"),ObjectId("5201484885b1d0cc7a00f35d"),ObjectId("5201782fbf54e991270169d7"),ObjectId("5204adb7e3629b187b000250"),ObjectId("52092ce812fae4601c00655c"),ObjectId("52095b1a12fae4601c00f8e2"),ObjectId("520a8dddf11dbfe307001e57"),ObjectId("520e392e995242cb1d006886"),ObjectId("520e6c0241031dec7e008cc0"),ObjectId("526dd05c50cff5930e011369"),ObjectId("529aa3b4dae6a26e7800423a"),ObjectId("51d722abcfa6bd8d4600b6d7"),ObjectId("51de53d697885c955c007bb0"),ObjectId("51ea11968856d1803100789c"),ObjectId("522e7651d9fac8761300cf03"),ObjectId("52367e4218aa44c0200089f3"),ObjectId("515b54ee0c0bee4a7b00000b"),ObjectId("5169d737676a40d77400000a"),ObjectId("517e134715690a522500000e"),ObjectId("51eb1fb2e029512e16007563"),ObjectId("520146b285b1d0cc7a00f2cc"),ObjectId("52014cb6bf54e991270114f6"),ObjectId("5201d8ef5c03a6d64a0055a4"),ObjectId("521c6d796da8690c50003704"),ObjectId("52574c4bbfdb3e035b000085"),ObjectId("528fe8d0b40014c04000977a"),ObjectId("5299af2adae6a26e780002a4"),ObjectId("529ce5cc545ade414500d91e"),ObjectId("514265596a9290970a000007"),ObjectId("51dc4236a5bd14720c00c8e3"),ObjectId("51eb20b78856d1803100b395"),ObjectId("51eebd0ae628d52c450002e6"),ObjectId("5201888685b1d0cc7a018595"),ObjectId("520539aee3629b187b009156"),ObjectId("520a9009f11dbfe3070020ee"),ObjectId("520a9474794aa7932c001c11"),ObjectId("52164814490b796161018654"),ObjectId("5234175d3d108ff5340077fe"),ObjectId("524db2d7f4172d324a007768"),ObjectId("527c1ebc79aa4a044a012d72"),ObjectId("515b50a2abc4000e2a000011"),ObjectId("515dd17aaff0c2e83e000007"),ObjectId("51db39c9f6916bbd6f008745"),ObjectId("51e9b250e029512e1600438d"),ObjectId("51edd30b5d99df930500010a"),ObjectId("51f626b0cb829c3701003a81"),ObjectId("5201787485b1d0cc7a01786b"),ObjectId("52017b82bf54e99127016efd"),ObjectId("52038502b4562b567d001872"),ObjectId("5203baa80d94215455003e2e"),ObjectId("5203dbe60d94215455006f47"),ObjectId("5207dafcb6a5f6291800d88a"),ObjectId("52320f0485fea9fe55010295"),ObjectId("51dc0eb1f6916bbd6f00ab3e"),ObjectId("51e9e34be029512e160058cb"),ObjectId("5201609a85b1d0cc7a014444"),ObjectId("52088729b6a5f6291801520c"),ObjectId("520c16e186f44894250184d2"),ObjectId("52321f352059916b7b00e74b"),ObjectId("52376c390eaad81822001427"),ObjectId("524c5df7661d3f7d0f022780"),ObjectId("52621e7a5959094110008aa7"),ObjectId("515e10b9aff0c2e83e000016"),ObjectId("51781464676a40d774000015"),ObjectId("5183ff944b5d88e27b000009"),ObjectId("51dc32daa5bd14720c00c0fe"),ObjectId("51e5d0e84b20454c0d0160d9"),ObjectId("520279909d3d2f265a004cd8"),ObjectId("5213b323061b3ea97d00b696"),ObjectId("524182f2fc03c0cd7701251a"),ObjectId("52562439c6c2d2332a007a09"),ObjectId("51ccd06b9545f00c76001b47"),ObjectId("51d4f827e992bcdf61008b5d"),ObjectId("520442b0f666a40a17000df5"),ObjectId("520be9d183b3d4bc3a01d745"),ObjectId("5232266c343a0a291a004c9d"),ObjectId("52325b7e343a0a291a008b72"),ObjectId("5233de1abe12f36a0f0064ce"),ObjectId("527d49592e56f1237d001315"),ObjectId("51f5e7c8cb829c3701001800"),ObjectId("5201dc595c03a6d64a0072a5"),ObjectId("526808bcf3eb1b977a0190f0"),ObjectId("515228545d3c0ea005000006"),ObjectId("515e38f88acbf94e1000001f"),ObjectId("51ecbc28e029512e1600b9a5"),ObjectId("51f2d6bd601ba3480f013b2f"),ObjectId("520193785c03a6d64a001254"),ObjectId("520259eb122bae8d31003960"),ObjectId("520273c69d3d2f265a004655"),ObjectId("520a612007f366b81b008a57")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 3");
db.mails.find({userId:{$in:[ObjectId("5239dd91add3cdd53100be8b"),ObjectId("5298b0ee980bc5ad50013f91"),ObjectId("515e18748acbf94e1000001d"),ObjectId("516c64c7676a40d77400000d"),ObjectId("517ffc9115690a5225000012"),ObjectId("5182ffee439986e25f000009"),ObjectId("51ed5fa7d9ba27f510003d19"),ObjectId("51eecfbde628d52c45001912"),ObjectId("51fffe24bdf9aacc0f0181bf"),ObjectId("5201654985b1d0cc7a014e6f"),ObjectId("52034d91122bae8d31016dbc"),ObjectId("5205097767dd0076240037e2"),ObjectId("522f727dcdcdc8741500cd03"),ObjectId("526713d15fb4ec9c19012619"),ObjectId("51cdbae68a340c8f14003491"),ObjectId("51e9c5598856d18031006411"),ObjectId("51ea46b2e029512e16005c4c"),ObjectId("520447e2f666a40a170010ef"),ObjectId("5209c32d12fae4601c01ce48"),ObjectId("51de2ffae0633c0178005616"),ObjectId("5206dc7db6a5f6291800a1fb"),ObjectId("52310574ca173b4a18000765"),ObjectId("5234aa2bfb11c0381e004fd0"),ObjectId("523feb2494ceb8ee0100330b"),ObjectId("52825fc88c28f279060019c7"),ObjectId("529141d2a0c9deee420162b4"),ObjectId("517dadc315690a522500000d"),ObjectId("51d76442cfa6bd8d4600de61"),ObjectId("51ec4cb88856d1803100e858"),ObjectId("51ff4f60d2a361463800cd49"),ObjectId("52018e2216ea3e2c220007bb"),ObjectId("52027f849d3d2f265a0054c9"),ObjectId("5277259aa61044c715004869"),ObjectId("5281447a97a03dca24017ad9"),ObjectId("528169af3aebbb6a2a001b8e"),ObjectId("528a7ff9477222374a01b72b"),ObjectId("515f7c3c4ce7d3cd41000005"),ObjectId("51819315c0ec9fe11a000009"),ObjectId("5193e7078f27a8e4730000ab"),ObjectId("52014327bf54e991270109b4"),ObjectId("52065f7967dd00762401864a"),ObjectId("520aaafd0ad0641914006d09"),ObjectId("522046ea13297efc6600debc"),ObjectId("5232af86d1d70ba96f008a2a"),ObjectId("528a8444477222374a01b9b8"),ObjectId("5298d142b59b2b4d370133cf"),ObjectId("51d5aa1de992bcdf610099ef"),ObjectId("51dd9daaa5bd14720c01b942"),ObjectId("52027eb49d3d2f265a00520d"),ObjectId("52030cb39d3d2f265a00fd7b"),ObjectId("5205224e67dd007624007ce2"),ObjectId("5226233c865173a9490016e9"),ObjectId("528996a95ed99a4d3700ae22"),ObjectId("51ba6a6b184aba05320015d4"),ObjectId("51e9be7be029512e160046c9"),ObjectId("51e9c9a2e029512e16005473"),ObjectId("520303139d3d2f265a00f7e5"),ObjectId("524a45921e43d95843017157"),ObjectId("528c4804dbd437b96000ad09"),ObjectId("529badd1dae6a26e7800827d"),ObjectId("51daecd8f6916bbd6f00599e"),ObjectId("5204bb8e67dd0076240006bf"),ObjectId("520a11ad9f7c3116110017b8"),ObjectId("52211589a7d957721600168e"),ObjectId("523e34e81526f8782e000f97"),ObjectId("5260984dc71bd0446b010a7e"),ObjectId("5277fe4910cb2829440109f3"),ObjectId("5192ee9d6aebff325900fb1f"),ObjectId("51d8a9003760d3045000012d"),ObjectId("51e8309d4b20454c0d0280ac"),ObjectId("51e9c05e8856d180310062da"),ObjectId("5202c7659d3d2f265a00a3c6"),ObjectId("520378330d942154550017a1"),ObjectId("520a5518bd264e4936003809"),ObjectId("52142eef86c901101800276a"),ObjectId("52317740ca173b4a18005068"),ObjectId("5240936394ceb8ee010173e8"),ObjectId("51d468c6e992bcdf61003a56"),ObjectId("5204b52667dd007624000454"),ObjectId("520aa18f0ad0641914003f56"),ObjectId("52557597d701eac00d014ae0"),ObjectId("5163861b4dbac9ce50000006"),ObjectId("51e6f44c4b20454c0d01c393"),ObjectId("51ec598ae029512e16009138"),ObjectId("5207874a67dd00762401cff5"),ObjectId("52092fda5864a5f57400517d"),ObjectId("52921c09b40014c0400150e6"),ObjectId("5153edd7a66e972a10000005"),ObjectId("517ffc57e88a5bbc77000011"),ObjectId("51dbfea3a5bd14720c00ac0a"),ObjectId("51ee3938408a721912000262"),ObjectId("52018a8b16ea3e2c2200001d"),ObjectId("5205713767dd007624011576"),ObjectId("5220e3b7b5484a536a001b3d"),ObjectId("526fc6917c8caf0b7b01b41e"),ObjectId("51426a56a8a4db7207000008"),ObjectId("516e4514676a40d774000010"),ObjectId("517ac03415690a5225000009"),ObjectId("51aceb739ca844752a004c69"),ObjectId("520141b1bf54e991270104e8")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 4");
db.mails.find({userId:{$in:[ObjectId("5202d981122bae8d31010530"),ObjectId("5203f2620d9421545500b2f1"),ObjectId("520554c1e3629b187b00df1e"),ObjectId("52060a1967dd0076240177e1"),ObjectId("5206f130b6a5f6291800ae2d"),ObjectId("520a5d309f7c3116110089fb"),ObjectId("520baf6986f448942500a0fe"),ObjectId("522cdc6586b7481555001c3b"),ObjectId("524a53b4bd1aecac17006850"),ObjectId("5154b06170b5ab0621000005"),ObjectId("51c8c575086058b13c00013d"),ObjectId("5201f23d5c03a6d64a00a914"),ObjectId("5203482e9d3d2f265a0128da"),ObjectId("520a75be6ac832c212000edc"),ObjectId("520af4822737093114001486"),ObjectId("526e83c11d7e4c556001519f"),ObjectId("516750ab676a40d774000006"),ObjectId("5190fa1d69a4607f1b000016"),ObjectId("51ea44ace029512e16005c49"),ObjectId("5217f46c6c67797f3300dd44"),ObjectId("5201d5a25c03a6d64a005296"),ObjectId("52027f009d3d2f265a0054c7"),ObjectId("5203da91b4562b567d00a72d"),ObjectId("523e36661526f8782e000f98"),ObjectId("5266bd3d5fb4ec9c19004fe8"),ObjectId("515230e45d3c0ea005000008"),ObjectId("516f60a3676a40d774000013"),ObjectId("51a90399ed74b1a73c00f5e6"),ObjectId("51e853156ea79a7c2802cfa1"),ObjectId("51ea5e638856d180310084a9"),ObjectId("520128ed85b1d0cc7a00c396"),ObjectId("52014313bf54e991270109b3"),ObjectId("5201c5fd16ea3e2c220041fd"),ObjectId("5202e9899d3d2f265a00cfb6"),ObjectId("5203c27fb4562b567d00815a"),ObjectId("5203e2e70d9421545500850d"),ObjectId("52070dbab6a5f6291800b237"),ObjectId("52090ab189c5e0a568014ae7"),ObjectId("5213a782061b3ea97d00a294"),ObjectId("52162dc51b7c2b3c3d01248a"),ObjectId("5213b44eccb62b5d2200cb58"),ObjectId("5232bc4fd1d70ba96f00948c"),ObjectId("523facf49bf4447f31003ce5"),ObjectId("528615bcb433cc53300265f4"),ObjectId("515dc0e12b0d97a63b000007"),ObjectId("51d9ec87f6916bbd6f000766"),ObjectId("5201861b85b1d0cc7a018156"),ObjectId("5201dc3d16ea3e2c22005694"),ObjectId("52027396122bae8d31005285"),ObjectId("52027bc29d3d2f265a004dc5"),ObjectId("5203193b9d3d2f265a010d7b"),ObjectId("520474105974ce186e003d8a"),ObjectId("5202f187122bae8d31013fec"),ObjectId("5207153ab6a5f6291800b578"),ObjectId("51e8a2c84b20454c0d02ad3e"),ObjectId("51e9c213e029512e16004742"),ObjectId("5205bd3867dd007624016771"),ObjectId("521c5267a4577bf825000774"),ObjectId("52608a37c71bd0446b00f829"),ObjectId("51d488d4e992bcdf610056b5"),ObjectId("51e9fd25e029512e16005b3d"),ObjectId("51ed78bcd9ba27f510005935"),ObjectId("51f4700852893ef96a0195d1"),ObjectId("52018db75c03a6d64a000ab8"),ObjectId("521541c82c572a3a2d00619d"),ObjectId("521b957ec3c6f08f3d01e359"),ObjectId("51434e7083da667b0d000005"),ObjectId("51a2bd015a302c3439010512"),ObjectId("51e6d6a96ea79a7c2801fde8"),ObjectId("51fedd0dd2a3614638009cba"),ObjectId("520e58b141031dec7e007d0f"),ObjectId("521acaca57200b9473002287"),ObjectId("527f638977af3b4a270003ab"),ObjectId("51d4da62cfa6bd8d460063aa"),ObjectId("51e9db8a8856d18031007649"),ObjectId("51f960c200c4b2e94a00a1cf"),ObjectId("52015dfd85b1d0cc7a01427f"),ObjectId("5202d65d122bae8d3100fc39"),ObjectId("5211885210747a445b00305a"),ObjectId("5213e9238ac3974c2900e292"),ObjectId("52199420d66ec3203900000a"),ObjectId("52276e54fb1d2a32550163ac"),ObjectId("52339b3c410628271c00afed"),ObjectId("523ba9158edf645f0c0050d6"),ObjectId("51966f2c91b1e96928036c85"),ObjectId("51c7d123e942e2303b0094e9"),ObjectId("51e9e475e029512e160058cc"),ObjectId("5204dead67dd007624001475"),ObjectId("520a93acf11dbfe3070025c4"),ObjectId("5213aa868ac3974c2900a21d"),ObjectId("5234ace3fb11c0381e004ff2"),ObjectId("5245d2c87734ae3514017025"),ObjectId("515dea3f8acbf94e10000014"),ObjectId("51ec4cab8856d1803100e7a4"),ObjectId("51fb0b354a8bd21b2802ca2b"),ObjectId("5201a29916ea3e2c220022a4"),ObjectId("520aa2aa794aa7932c002737"),ObjectId("52145c25b65fc4903c002723"),ObjectId("522e0dac845f6d0c12013b94"),ObjectId("523665ae2b7695705f000256")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 5");
db.mails.find({userId:{$in:[ObjectId("523d3eb7089a90802c00fb24"),ObjectId("515d0c766dc3e3370c000005"),ObjectId("51687f11e02a657747000006"),ObjectId("5183fbbd439986e25f00000a"),ObjectId("51b26c7f3317b17e30019f3d"),ObjectId("51ea330ae029512e16005c27"),ObjectId("51eda78cd9ba27f510009371"),ObjectId("51fedba1d2a3614638009cb8"),ObjectId("5202a9889d3d2f265a007f11"),ObjectId("520321939d3d2f265a010fea"),ObjectId("525c4fc7f81e73595b00064d"),ObjectId("515a96090c0bee4a7b000008"),ObjectId("515b43f8abc4000e2a00000f"),ObjectId("515cd609f6ebe4bc09000005"),ObjectId("519912eac0719d8c25084329"),ObjectId("51e9b1cae029512e1600438c"),ObjectId("51ea33dae029512e16005c28"),ObjectId("51eda4be6e8922be740098c0"),ObjectId("5201475b85b1d0cc7a00f2d6"),ObjectId("520173bdbf54e991270165b7"),ObjectId("52070c26b6a5f6291800b211"),ObjectId("520b149b83b3d4bc3a0027f8"),ObjectId("528e3cae7cb7c2731100d4d7"),ObjectId("514ba916850d792757000005"),ObjectId("51f1c26b601ba3480f0079a2"),ObjectId("520141a0bf54e991270104e7"),ObjectId("520271b9122bae8d31004d76"),ObjectId("52446dd556bc48437600a46b"),ObjectId("527fd90177af3b4a270035f6"),ObjectId("515e013faff0c2e83e000011"),ObjectId("51df107897885c955c009666"),ObjectId("51e460806ea79a7c2800e686"),ObjectId("51ea5ec4e029512e16005d34"),ObjectId("5201594abf54e991270143ee"),ObjectId("520197745c03a6d64a001921"),ObjectId("521275c6f68748212700698a"),ObjectId("52585d45192bb75016002d23"),ObjectId("5273ee44d476992f57002fbc"),ObjectId("527d7245da249abd22010f7b"),ObjectId("517e143ee88a5bbc7700000f"),ObjectId("5195f4d2c0719d8c25037ed0"),ObjectId("51b55f95b27daf476e008cc7"),ObjectId("51b8f758de456b604b05f78c"),ObjectId("51e9c4568856d180310063f6"),ObjectId("51f7e9df87ecd1525c01900e"),ObjectId("52048b855974ce186e0059ac"),ObjectId("52072f6667dd00762401befd"),ObjectId("520d4d16391acfc61a006339"),ObjectId("52111a1810747a445b0005d3"),ObjectId("5217ef4357ea88bb1b0071a5"),ObjectId("5249e1361e43d958430094bd"),ObjectId("526f7d167c8caf0b7b00f9d2"),ObjectId("519da572360be9fa7d01678a"),ObjectId("51ceff608a340c8f140099be"),ObjectId("51ebeef1e029512e160084c4"),ObjectId("520124d785b1d0cc7a00b906"),ObjectId("515b0e55abc4000e2a00000a"),ObjectId("515dd4558acbf94e1000000c"),ObjectId("51d59e9fe992bcdf61009865"),ObjectId("51e9a3b38856d180310042da"),ObjectId("51e9c54c8856d18031006410"),ObjectId("51e9c9258856d18031006648"),ObjectId("51ec18678856d1803100da10"),ObjectId("51f8670f00c4b2e94a00004b"),ObjectId("520154acbf54e99127012473"),ObjectId("5202da58122bae8d3101055f"),ObjectId("5238e8d53d89583c3d011057"),ObjectId("514266e16a9290970a000008"),ObjectId("515de5608acbf94e10000011"),ObjectId("5202c6c9122bae8d3100ea94"),ObjectId("52030ba79d3d2f265a00fa7e"),ObjectId("5209c61b12fae4601c01cfdc"),ObjectId("5234e91ffb11c0381e00667b"),ObjectId("523b3adb7f357d5c49016702"),ObjectId("524252878a17276b160108a8"),ObjectId("5259b6efee0e529475008e80"),ObjectId("52888c575ed99a4d370002df"),ObjectId("529ce57064fd375177023db1"),ObjectId("515dd61f8acbf94e1000000e"),ObjectId("519a7ee8c0719d8c25094325"),ObjectId("51d49016e992bcdf6100644e"),ObjectId("51ed7c21d9ba27f510006234"),ObjectId("51f8a44800c4b2e94a002626"),ObjectId("52027abb9d3d2f265a004d12"),ObjectId("52143ac386c901101800320b"),ObjectId("5214407a86c90110180032cd"),ObjectId("515b75dcabc4000e2a000013"),ObjectId("51d866a2cfa6bd8d4600f140"),ObjectId("51ea02f18856d18031007893"),ObjectId("51fc01ae1719569f19008359"),ObjectId("51fc34c2d2a36146380010e9"),ObjectId("5210224ebad3a333200046c5"),ObjectId("52509ce07a72a068230088eb"),ObjectId("51d3da4bcfa6bd8d460010a3"),ObjectId("51d5eb3ee992bcdf61009df9"),ObjectId("51e9cb148856d18031006925"),ObjectId("51ecb5658856d18031010ded"),ObjectId("5201822785b1d0cc7a017ee5"),ObjectId("52042dea0d942154550145c6"),ObjectId("52052af167dd0076240086a3")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 6");
db.mails.find({userId:{$in:[ObjectId("52069957b6a5f62918006b12"),ObjectId("5209b2d59389d5ac060038b6"),ObjectId("521f87810f64d3e7650011c9"),ObjectId("5230f3cb1051ec5060009899"),ObjectId("523339c87629334a160126e4"),ObjectId("523cefd6089a90802c00e69e"),ObjectId("5271a5b0af7eaf413c00878d"),ObjectId("5285c710b433cc5330022d48"),ObjectId("5147afc4f287efc831000005"),ObjectId("51d87bb0cfa6bd8d460108ed"),ObjectId("51f889814a8bd21b28001b6d"),ObjectId("520dd1ab8800de0360003485"),ObjectId("52369c1018aa44c02000a0b5"),ObjectId("52901ecea0c9deee42011f81"),ObjectId("529cda79d696c69259010ea8"),ObjectId("515dcddb8acbf94e10000006"),ObjectId("519fef225a302c343900adfd"),ObjectId("51d540e2e992bcdf610090ca"),ObjectId("51ec59f48856d1803100ebce"),ObjectId("51f1b5ae601ba3480f0063b5"),ObjectId("52014617bf54e99127010f50"),ObjectId("5203b6d10d94215455003b97"),ObjectId("52070de9b6a5f6291800b239"),ObjectId("520a577a07f366b81b0074e6"),ObjectId("52578833c3fa15035c000db4"),ObjectId("528dbcf486b0ce72250165ff"),ObjectId("5168441d676a40d774000007"),ObjectId("51c95ed69479d9ef27002c77"),ObjectId("51db0992a5bd14720c006e07"),ObjectId("51e9c6bb8856d18031006642"),ObjectId("51eed01be628d52c45001916"),ObjectId("51f81f16cb829c370101f78d"),ObjectId("5226153326bf4c0f1400f371"),ObjectId("52387a313d89583c3d00207e"),ObjectId("515227d3f49e706306000008"),ObjectId("51d7cf83cfa6bd8d4600ee09"),ObjectId("51e5d1144b20454c0d0160da"),ObjectId("51e9d84e8856d18031007594"),ObjectId("523211512059916b7b00dd12"),ObjectId("523d2783beae15662b008561"),ObjectId("515dd6018acbf94e1000000d"),ObjectId("515e037e8acbf94e10000019"),ObjectId("51ecb92be029512e1600b9a4"),ObjectId("52016c3085b1d0cc7a01643f"),ObjectId("52043678b4562b567d01793b"),ObjectId("52092fe512fae4601c0075a8"),ObjectId("520d27fe710324b35f0115dd"),ObjectId("521d5d3ba97e0d434b0011ef"),ObjectId("5244a7c256bc484376014faa"),ObjectId("524a2b871e43d9584301521c"),ObjectId("5278002ba61044c71500d835"),ObjectId("515a8b590c0bee4a7b000007"),ObjectId("51a6435d5a302c34390313a5"),ObjectId("51dca79ca5bd14720c015a58"),ObjectId("51e33f296ea79a7c280072e8"),ObjectId("52093e4312fae4601c00c169"),ObjectId("521253759711b7db07003d73"),ObjectId("51e9ab53e029512e160030ff"),ObjectId("51ea2efbe029512e16005c22"),ObjectId("520f11282d60ba1520002aec"),ObjectId("5218c6ffa3776db506003e6f"),ObjectId("521f8dc43890944564004c38"),ObjectId("52276b9afb1d2a3255015bbc"),ObjectId("52388e486d465412170060d4"),ObjectId("515dd4f4aff0c2e83e00000b"),ObjectId("5185775b4b5d88e27b00000a"),ObjectId("51edcbeed9ba27f51000b5aa"),ObjectId("51eefd13e628d52c45005c73"),ObjectId("5205ee1d67dd0076240171c9"),ObjectId("5206ad3fb6a5f6291800719b"),ObjectId("5209085789c5e0a568014501"),ObjectId("5238f1a03d89583c3d011fe6"),ObjectId("52408febcdcdfb855b01a6d6"),ObjectId("524d78990b78df465401fbf0"),ObjectId("526a9efc8dca0af13f01e8fa"),ObjectId("5281291577af3b4a2701b253"),ObjectId("529b146a7b66aadb54007319"),ObjectId("515f59319182bfae13000005"),ObjectId("518e58644998de923900000f"),ObjectId("51d48572e992bcdf61005670"),ObjectId("51e729e76ea79a7c28023232"),ObjectId("51ed0decd9ba27f510000eac"),ObjectId("51f982594a8bd21b280161df"),ObjectId("5201c4bf16ea3e2c220041fc"),ObjectId("520436160d9421545501558b"),ObjectId("5208f8cc89c5e0a56800f70e"),ObjectId("5211bb5337fb5e8d24005915"),ObjectId("51522327f49e706306000007"),ObjectId("515b103dabc4000e2a00000b"),ObjectId("515dd864aff0c2e83e00000e"),ObjectId("51911e54b604c63837000009"),ObjectId("51e9bb338856d18031005c57"),ObjectId("52014d1385b1d0cc7a00ffb8"),ObjectId("520266bd9d3d2f265a003608"),ObjectId("5204376d0d9421545501563f"),ObjectId("520449a4f666a40a170010fe"),ObjectId("520537cb67dd00762400b094"),ObjectId("520dccc9995242cb1d002b41"),ObjectId("521994b4a3776db50600d769"),ObjectId("524c4689d131f54c33022e86")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 7");
db.mails.find({userId:{$in:[ObjectId("515d1a372b0d97a63b000005"),ObjectId("515dcd55aff0c2e83e000005"),ObjectId("51de18d9e0633c017800560b"),ObjectId("51ede2c45d99df930500100e"),ObjectId("51f6ee0e87ecd1525c00fb5e"),ObjectId("51faa1c200c4b2e94a01c192"),ObjectId("523386b43d108ff534001f70"),ObjectId("52781b1910cb282944012f59"),ObjectId("52794c642a7bd87612002e98"),ObjectId("515dce918acbf94e10000007"),ObjectId("515dd5eeaff0c2e83e00000c"),ObjectId("51d59360e992bcdf61009620"),ObjectId("51df0e22e0633c0178008443"),ObjectId("51e9f263e029512e16005b2d"),ObjectId("5206c8edb6a5f629180098b6"),ObjectId("5225f73c2a5261a77c00dfa1"),ObjectId("5226df0423759da10200a45c"),ObjectId("5241cc869f6e039435006223"),ObjectId("51abbf786af1a8cc7d002a76"),ObjectId("520146a085b1d0cc7a00f2cb"),ObjectId("521fa3473890944564007cb7"),ObjectId("5297ae30980bc5ad5000815d"),ObjectId("515f5f029182bfae13000006"),ObjectId("51e82b5d6ea79a7c28027340"),ObjectId("52016858bf54e991270154a2"),ObjectId("5202e107122bae8d31010d2d"),ObjectId("5202fe1c9d3d2f265a00dd1f"),ObjectId("520dcc8341031dec7e003f0e"),ObjectId("5222e315db5e7d004000f434"),ObjectId("5232b016d1d70ba96f008aa4"),ObjectId("52498f3e3eabe8985e006538"),ObjectId("524a52491e43d9584301909e"),ObjectId("515b46f4abc4000e2a000010"),ObjectId("518704a84b5d88e27b00000c"),ObjectId("5192ef37acbf8c903a00edc5"),ObjectId("51eaeb468856d1803100a774"),ObjectId("51f1c5de601ba3480f007ac7"),ObjectId("5203479b9d3d2f265a0128d7"),ObjectId("5203bc640d94215455003ebc"),ObjectId("5209311612fae4601c0079f8"),ObjectId("520a93340ad06419140022bb"),ObjectId("5232014e343a0a291a000d13"),ObjectId("523222eb343a0a291a004afe"),ObjectId("529ce58dd696c69259011dbd"),ObjectId("51d6e369cfa6bd8d46009aa6"),ObjectId("51dc3328a5bd14720c00c0ff"),ObjectId("51eae65ee029512e16005eb4"),ObjectId("51ef6396ca780e922d002816"),ObjectId("515e03118acbf94e10000017"),ObjectId("515fa1da4ce7d3cd41000007"),ObjectId("5165a9ddcbaba57c6a000005"),ObjectId("51dadda6a5bd14720c00395f"),ObjectId("51eb59d18856d1803100c803"),ObjectId("51ec5bf28856d1803100ebcf"),ObjectId("51ed60726e8922be740040ed"),ObjectId("520468af5974ce186e003b5b"),ObjectId("52057c8867dd007624014776"),ObjectId("524df4f5d52cb3965000b37f"),ObjectId("526dafa573271b7f2f00fdb8"),ObjectId("516ee108676a40d774000011"),ObjectId("51d4f1efe992bcdf61008b5c"),ObjectId("51da4062a5bd14720c001b3a"),ObjectId("51e9ab878856d18031004a45"),ObjectId("51f5a0e2601ba3480f01fc72"),ObjectId("52014ce8bf54e991270114f7"),ObjectId("520889bd67dd007624025e4b"),ObjectId("52091fff12fae4601c003717"),ObjectId("5284343d23171b9408009e48"),ObjectId("51e049614b20454c0d00150b"),ObjectId("5205476467dd00762400cb07"),ObjectId("520d16e4710324b35f00ee8c"),ObjectId("521599251b7c2b3c3d001baa"),ObjectId("5267f1a2e2a87e903e0007e5"),ObjectId("5144e9e3d6ebe46812000005"),ObjectId("5163166274dc3ab620000005"),ObjectId("51f73fa2cb829c3701015758"),ObjectId("51ff39bad2a361463800ca00"),ObjectId("5201444e85b1d0cc7a00edb2"),ObjectId("520389910d94215455001f08"),ObjectId("51676676e02a657747000005"),ObjectId("51a5436e5a302c3439027c82"),ObjectId("51d4317bcfa6bd8d460017a6"),ObjectId("51d4e19acfa6bd8d4600645f"),ObjectId("520144a1bf54e99127010d67"),ObjectId("52017167bf54e991270161eb"),ObjectId("5201a87316ea3e2c22002a2e"),ObjectId("520451505974ce186e001cab"),ObjectId("52276ba623759da10201a00d"),ObjectId("523b3ec87f357d5c490173bb"),ObjectId("5251f7351127b0a650006523"),ObjectId("52557af96f40d3143d00d640"),ObjectId("5285b9629827c8a44d00ff1b"),ObjectId("51645e9994ae42371a000006"),ObjectId("520142d585b1d0cc7a00ebcc"),ObjectId("52014a47bf54e99127011332"),ObjectId("52018378bf54e99127017256"),ObjectId("5202b341122bae8d3100c214"),ObjectId("51ff96d5d2a361463800ee6e"),ObjectId("5205b1b2b6a5f6291800002a"),ObjectId("5205f39467dd007624017372")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 8");
db.mails.find({userId:{$in:[ObjectId("520870a267dd0076240242cd"),ObjectId("5208f08789c5e0a56800d722"),ObjectId("52213133db5e7d004000153a"),ObjectId("5237a53de5c8e9f42201918f"),ObjectId("526ef23cde0b454a3e027f7c"),ObjectId("5276d626a61044c715002c01"),ObjectId("516c6df5e02a65774700000b"),ObjectId("5196c4c0c0719d8c2506c7f0"),ObjectId("51a6d7ee065acebd0800004c"),ObjectId("51dce364a5bd14720c016b53"),ObjectId("51e027f96ea79a7c28000b77"),ObjectId("51e5e0826ea79a7c2801c67d"),ObjectId("51eeefb75264781a21003cce"),ObjectId("52016a6185b1d0cc7a0156a2"),ObjectId("520179de85b1d0cc7a017c0d"),ObjectId("5201a2e216ea3e2c220022a5"),ObjectId("52014a42bf54e99127011331"),ObjectId("52031ecd122bae8d310158e0"),ObjectId("52044805f666a40a170010f2"),ObjectId("5226360c865173a9490045c8"),ObjectId("5237db4ff065cdf723004488"),ObjectId("527f4779ce4eaa9f5400f196"),ObjectId("515e03fa8acbf94e1000001a"),ObjectId("515f1c3caff0c2e83e00001b"),ObjectId("5162184fe974eff94d000005"),ObjectId("51ed6ee4d9ba27f5100052db"),ObjectId("5204466af666a40a170010dd"),ObjectId("52067d8467dd0076240192bb"),ObjectId("524d86f1f4172d324a0003e0"),ObjectId("5270386e362978c10b0010d6"),ObjectId("515dd68faff0c2e83e00000d"),ObjectId("515de232aff0c2e83e00000f"),ObjectId("517d9d71e88a5bbc7700000e"),ObjectId("51f5a12c601ba3480f01fc73"),ObjectId("5217a8bc06048b9575002039"),ObjectId("521bee09fcd15028110089e4"),ObjectId("524cce312129af384800603c"),ObjectId("5163ae8694ae42371a000005"),ObjectId("5195971591b1e96928009d3e"),ObjectId("51dd8b58a5bd14720c019dc6"),ObjectId("51dfa3aa4b20454c0d0002ba"),ObjectId("51ea314a8856d18031008319"),ObjectId("51f176a552893ef96a000cd2"),ObjectId("525c2e3ced68ca007f0029d6"),ObjectId("5273d1c799525ac911008e4d"),ObjectId("515de5db8acbf94e10000012"),ObjectId("515f0822aff0c2e83e000019"),ObjectId("51e9d6ea8856d18031007584"),ObjectId("51edce8bd9ba27f51000b6c9"),ObjectId("520185c7bf54e991270174ae"),ObjectId("5201a1915c03a6d64a001f5c"),ObjectId("521b4434c3c6f08f3d015a25"),ObjectId("521bd843fcd1502811006e3d"),ObjectId("52446c3256bc48437600a115"),ObjectId("52557adbd701eac00d015c72"),ObjectId("527709f6436a7c0c070036e6"),ObjectId("528169f43aebbb6a2a001cef"),ObjectId("528f0f367cb7c2731101e03f"),ObjectId("515b72fa0c0bee4a7b00000c"),ObjectId("5165f33603aaef2622000005"),ObjectId("517b158115690a522500000a"),ObjectId("519bb61791b1e96928073f9a"),ObjectId("51da0fd8f6916bbd6f0013d2"),ObjectId("51e9c912e029512e1600545e"),ObjectId("51edcdb65d99df930500008d"),ObjectId("52004588bf54e991270011c3"),ObjectId("52014e0285b1d0cc7a0104c6"),ObjectId("52060ca467dd0076240177e3"),ObjectId("5207fdd867dd00762401f3e6"),ObjectId("52086f68b6a5f629180137e8"),ObjectId("5232154a343a0a291a002e9a"),ObjectId("52819d7b176018b92a0001b0"),ObjectId("5282f1a83f9f34a21300223f"),ObjectId("519e772b360be9fa7d01f62e"),ObjectId("51d4ac44e992bcdf61007ec9"),ObjectId("51ed1c2d6e8922be74000d09"),ObjectId("51fc2f34bdf9aacc0f00010e"),ObjectId("52014d3b85b1d0cc7a00ffbb"),ObjectId("52015fd8bf54e99127014b48"),ObjectId("52016cb585b1d0cc7a0164a0"),ObjectId("5203f286b4562b567d00e922"),ObjectId("520a5d8d9f7c3116110089fd"),ObjectId("5212f68f9711b7db07014e07"),ObjectId("52333d0ed1d70ba96f014721"),ObjectId("5268732b283c639420007029"),ObjectId("5249a1e83eabe8985e009173"),ObjectId("5286bd859827c8a44d02148d"),ObjectId("517e1dd215690a522500000f"),ObjectId("519bb79fda39454d5400b262"),ObjectId("520197ff5c03a6d64a001922"),ObjectId("5201fde65c03a6d64a00b4f2"),ObjectId("520298ab122bae8d31009737"),ObjectId("5202f14c9d3d2f265a00d673"),ObjectId("5205c102b6a5f629180001f9"),ObjectId("520faaa32d60ba1520003ba8"),ObjectId("522cdc1f3ba332c37a0021c0"),ObjectId("526558b1e4fa1c8b6a0158cc"),ObjectId("518e70fe69a4607f1b000010"),ObjectId("51d49088e992bcdf6100644f"),ObjectId("51e06b006ea79a7c28002a20")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 9");
db.mails.find({userId:{$in:[ObjectId("51ead3bee029512e16005ea7"),ObjectId("5205375067dd00762400af57"),ObjectId("521fe5090f64d3e76500a614"),ObjectId("524309132c7bd52c580020e8"),ObjectId("5282a79c43777b962c0048c7"),ObjectId("52978b16980bc5ad50006b14"),ObjectId("51ecad46e029512e1600b429"),ObjectId("52016a3cbf54e991270154dc"),ObjectId("52030cab122bae8d31014bae"),ObjectId("5204131db4562b567d013702"),ObjectId("524a0de69e0583fe0301d89a"),ObjectId("51d87e3ae992bcdf6100fba7"),ObjectId("51e8a3104b20454c0d02ad3f"),ObjectId("51e99c798856d18031003bbb"),ObjectId("51f1bcdb601ba3480f006e72"),ObjectId("520148e585b1d0cc7a00f624"),ObjectId("5201667f85b1d0cc7a0150b7"),ObjectId("520a6aa2bd264e49360052e6"),ObjectId("520d309d1060b08418013cf0"),ObjectId("521809166c67797f3300eaeb"),ObjectId("523a14c1205592a02700f42e"),ObjectId("524c985d0b78df46540078b6"),ObjectId("5277589d436a7c0c07006ca6"),ObjectId("51625b684b680a0c4e000005"),ObjectId("51ec8de68856d1803100f45c"),ObjectId("520167e885b1d0cc7a015599"),ObjectId("52016981bf54e991270154d6"),ObjectId("5202ccb9122bae8d3100ec73"),ObjectId("518ec58c4998de9239000012"),ObjectId("5207ff9eb6a5f6291800e55b"),ObjectId("52094e7b12fae4601c00e183"),ObjectId("5209bb1d7cd522f507005edd"),ObjectId("521d28e655c690211c0011a5"),ObjectId("524a40421e43d95843016717"),ObjectId("515ef8978acbf94e10000021"),ObjectId("51e5bb164b20454c0d0150b5"),ObjectId("51eaeb608856d1803100a775"),ObjectId("5205af11b6a5f62918000029"),ObjectId("5207b65fb6a5f6291800cf83"),ObjectId("520993de12fae4601c01a20d"),ObjectId("520a5749bd264e4936003a68"),ObjectId("520e68698800de03600080d4"),ObjectId("5215a1e6896520e92e00381f"),ObjectId("521956cfa3776db50600c74c"),ObjectId("524b0d59da36bf0545016ae2"),ObjectId("5178a1ca676a40d774000017"),ObjectId("519da5c3360be9fa7d01678b"),ObjectId("51cae2aae14335586d001348"),ObjectId("51d80777cfa6bd8d4600eeca"),ObjectId("51ed58226e8922be74003881"),ObjectId("5202c599122bae8d3100e9d5"),ObjectId("5229f2bf69f6aea60a00c6c6"),ObjectId("525c282084310bfb55001fba"),ObjectId("52941e9821eff0354a00784f"),ObjectId("51b4843fb27daf476e004e0f"),ObjectId("51dafd39f6916bbd6f006c98"),ObjectId("51e9c6e08856d18031006644"),ObjectId("51edc1c16e8922be7400bedf"),ObjectId("52713f12f4463b1b1e01f29b"),ObjectId("529787110e4c79bc70016ca0"),ObjectId("515a7e01abc4000e2a000005"),ObjectId("5160b5f6c33a1f391c000007"),ObjectId("516a1142e02a657747000008"),ObjectId("51dfa9496ea79a7c2800014c"),ObjectId("51f9639900c4b2e94a00ab8a"),ObjectId("5209390b12fae4601c00950b"),ObjectId("522bd0c56c5abfe648007caf"),ObjectId("5232ae5c7629334a16007c15"),ObjectId("5237a5540eaad818220068e7"),ObjectId("52825f768c28f279060019c6"),ObjectId("528408cd23171b94080065ed"),ObjectId("515bd9900c0bee4a7b00000e"),ObjectId("515efd5aaff0c2e83e000018"),ObjectId("51930e80acbf8c903a00ee24"),ObjectId("51d8a1cf4ef29d2a6b00022f"),ObjectId("51dc49a4a5bd14720c00e158"),ObjectId("51edbe7b6e8922be7400bc54"),ObjectId("51eeb9234595c75736002380"),ObjectId("51fcb2f3d2a3614638003f02"),ObjectId("5209e7af12fae4601c01e238"),ObjectId("5251ee01efebe93b5a0058ce"),ObjectId("515deed18acbf94e10000015"),ObjectId("51d6ce8de992bcdf6100b419"),ObjectId("51edb051d9ba27f510009dcc"),ObjectId("520045cd85b1d0cc7a002a77"),ObjectId("520913375864a5f5740004b6"),ObjectId("52118720eeae4d663c0030ba"),ObjectId("521296d99711b7db0700da6b"),ObjectId("522a9f99ca8be8842801d200"),ObjectId("515dd3cbaff0c2e83e000009"),ObjectId("515e0190aff0c2e83e000012"),ObjectId("519e43fed84988c86401548b"),ObjectId("51df1846e0633c0178009f21"),ObjectId("51edcf42d9ba27f51000b8d1"),ObjectId("520280ce122bae8d31005f67"),ObjectId("5209b91212fae4601c01c51d"),ObjectId("520eb48ebad3a33320001286"),ObjectId("524a796bda36bf05450024ad"),ObjectId("517b7589e88a5bbc7700000c"),ObjectId("51d4697fe992bcdf61003a57")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 10");
db.mails.find({userId:{$in:[ObjectId("51e9b12a8856d18031005600"),ObjectId("51eafef2e029512e16005fa3"),ObjectId("51edaf07d9ba27f510009aa8"),ObjectId("51f8671e4a8bd21b28000017"),ObjectId("52016050bf54e99127014b5e"),ObjectId("527d2ba8da249abd2200939b"),ObjectId("51604203c33a1f391c000005"),ObjectId("51e9c5c7e029512e16004d07"),ObjectId("51ec89a1e029512e160098f4"),ObjectId("5203dfee0d94215455007f0d"),ObjectId("52088052b6a5f629180144f2"),ObjectId("520d70b941031dec7e00068a"),ObjectId("5262c6c40e0d84bc0a0001a7"),ObjectId("527fe394ce4eaa9f5401203d"),ObjectId("515a70060c0bee4a7b000006"),ObjectId("517d9cf3e88a5bbc7700000d"),ObjectId("52014e96bf54e9912701150b"),ObjectId("520a7ddc794aa7932c0001b5")]}},{_id:1,gmDate:1,gmLabels:1,userId:1,subject:1}).forEach(function(m){m.isSent=0;m.isOriginal=1;m.hourOfWeek=0;db.caMailAnalytics.insert(m);});
print("Checkpoint 11");

db.caMailAnalytics.update({gmLabels:/Sent/},{$set:{isSent:1}}, false, true);
print("Checkpoint 12");
db.caMailAnalytics.update({subject:/:/},{$set:{isOriginal:0}}, false, true);

print("Checkpoint 13");
db.caMailAnalytics.find({hourOfWeek:0}).forEach( function(m){
  var hourOfWeek = (m.gmDate.getDay()*24)+m.gmDate.getHours();
  m.hourOfWeek=hourOfWeek;
  db.caMailAnalytics.save(m);
} );

print("Checkpoint 14");
db.caMailAnalytics.mapReduce( function(){ emit(this.hourOfWeek, (1-this.isSent)); }, function(hourOfWeek, isReceived){ return Array.sum(isReceived); }, {out: "caMailAnalyticsOutputReceived"});
print("Checkpoint 15");
db.caMailAnalytics.mapReduce( function(){ emit(this.hourOfWeek, (this.isSent && this.isOriginal)); }, function(hourOfWeek, isTrue){ return Array.sum(isTrue); }, {out: "caMailAnalyticsOutputSentOriginal"});
print("Checkpoint 16");
db.caMailAnalytics.mapReduce( function(){ emit(this.hourOfWeek, (this.isSent && (1-this.isOriginal))); }, function(hourOfWeek, isTrue){ return Array.sum(isTrue); }, {out: "caMailAnalyticsOutputSentResponse"});
print("Checkpoint 17");

db.caMailAnalytics.ensureIndex({userId:1,subject:1,isSent:1},{background:true});
print("Checkpoint 18");

db.caMailAnalytics.find({subject:/Re:/,isSent:1,responseIdentified:{$ne:1},responseProcessed:{$ne:1}}).forEach( function(m) {
  var newSubject = m.subject;
  var ok = false;
  if(m.subject.substring(0, 4) == "Re: ") {
    newSubject = m.subject.substring(4);
    ok = true;
  } else if (m.subject.substring(0, 3) == "Re:") {
    newSubject = m.subject.substring(3);
    ok = true;
  }
  if ( ok ) {
    m.candidateResponse = 1;
    m.responseIdentified = 0;
    m.responseProcessed = 0;
    m.secondsSinceOriginal = 0;
    db.caMailAnalytics.save(m);
  }
} );

print("Checkpoint 19");
db.caMailAnalytics.find({candidateResponse:1,responseIdentified:{$ne:1},responseProcessed:{$ne:1}}).forEach( function(m) {
  var newSubject = m.subject;
  if(m.subject.substring(0, 4) == "Re: ") {
    newSubject = m.subject.substring(4);
  } else if (m.subject.substring(0, 3) == "Re:") {
    newSubject = m.subject.substring(3);
  }
  var count = db.caMailAnalytics.find({userId:m.userId,subject:newSubject,isSent:0}).count();
  if ( count == 1 ) {
    m.responseIdentified = 1;
  } else {
    m.responseProcessed = 1;
  }
  db.caMailAnalytics.save(m);
} );

print("Checkpoint 20");
db.caMailAnalytics.find({responseIdentified:1,responseProcessed:{$ne:1}}).forEach( function(m) {
  var newSubject = m.subject;
  if(m.subject.substring(0, 4) == "Re: ") {
    newSubject = m.subject.substring(4);
  } else if (m.subject.substring(0, 3) == "Re:") {
    newSubject = m.subject.substring(3);
  }
  db.caMailAnalytics.find({userId:m.userId,subject:newSubject,isSent:0}).forEach( function(originalMail) {
    var dateDiff = m.gmDate - originalMail.gmDate;
    var secondsDiff = dateDiff / 1000;
    m.secondsSinceOriginal = secondsDiff;
    m.responseProcessed = 1;
    db.caMailAnalytics.save(m);
  });
} );