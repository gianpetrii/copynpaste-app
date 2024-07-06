import 'dart:async';

import 'package:collection/collection.dart';

import '/backend/schema/util/firestore_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ElementsRecord extends FirestoreRecord {
  ElementsRecord._(
    super.reference,
    super.data,
  ) {
    _initializeFields();
  }

  // "info" field.
  String? _info;
  String get info => _info ?? '';
  bool hasInfo() => _info != null;

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  bool hasUser() => _user != null;

  // "created" field.
  DateTime? _created;
  DateTime? get created => _created;
  bool hasCreated() => _created != null;

  void _initializeFields() {
    _info = snapshotData['info'] as String?;
    _user = snapshotData['user'] as DocumentReference?;
    _created = snapshotData['created'] as DateTime?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('elements');

  static Stream<ElementsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => ElementsRecord.fromSnapshot(s));

  static Future<ElementsRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => ElementsRecord.fromSnapshot(s));

  static ElementsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      ElementsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static ElementsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      ElementsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'ElementsRecord(reference: ${reference.path}, data: $snapshotData)';

  @override
  int get hashCode => reference.path.hashCode;

  @override
  bool operator ==(other) =>
      other is ElementsRecord &&
      reference.path.hashCode == other.reference.path.hashCode;
}

Map<String, dynamic> createElementsRecordData({
  String? info,
  DocumentReference? user,
  DateTime? created,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'info': info,
      'user': user,
      'created': created,
    }.withoutNulls,
  );

  return firestoreData;
}

class ElementsRecordDocumentEquality implements Equality<ElementsRecord> {
  const ElementsRecordDocumentEquality();

  @override
  bool equals(ElementsRecord? e1, ElementsRecord? e2) {
    return e1?.info == e2?.info &&
        e1?.user == e2?.user &&
        e1?.created == e2?.created;
  }

  @override
  int hash(ElementsRecord? e) =>
      const ListEquality().hash([e?.info, e?.user, e?.created]);

  @override
  bool isValidKey(Object? o) => o is ElementsRecord;
}
